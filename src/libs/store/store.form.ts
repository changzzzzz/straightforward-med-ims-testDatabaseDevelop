import supabaseService from "../services/supabase";
import { create } from "zustand";
import useAuthStore from "@/ims/store/store.auth";
import { Form } from "react-router-dom";
import { int } from "@zxing/library/esm/customTypings";
import { boolean, evaluate, parse, random } from 'mathjs';
import { PostgrestError } from "@supabase/supabase-js";

const useFormStore = create((set, get: any) => ({
    numQuestions: 0,
    formName: '',
    hasChanges: false,
    questions: [],
    question_options: {},
    question_responses: {},
    question_metadata: {},
    clinID: 0,
    patientID: 0,

    formLoad:async (formName: string) => {
        const getClinician = () => {
            if (JSON.parse(JSON.stringify(localStorage.getItem("csu_user")))) {
              return JSON.parse(localStorage.getItem("csu_user") || "");
            }
            return {};
        };

        // FIX, GETTING RID OF !
        const patientID:string = localStorage.getItem('PatientID')!;
        let patientData: Patient|null = null;

        // Improve the following
        if (patientID !== null) {
            supabaseService.setTable("Patient");
            const patientResponse = await supabaseService.selectBy('patient_id',patientID);
            patientData = patientResponse.result;
            patientData = {
                ...patientResponse.result,
                patient_DOB : new Date(patientResponse.result.patient_DOB)
            }
        } else {
            console.error("PatientID is null. Cannot fetch patient data.");
        }

        const form_questions: FormQuestionResult = await supabaseService.getFormQuestions(formName);
        console.log(form_questions);

        const optionsTable = await supabaseService.getFormOptions(formName);
        const optionsDictionary = optionsTable.result.reduce((acc, row) => {
            const { quest_id, ...attributes} = row;
          
            if (!acc[quest_id]) {
              acc[quest_id] = [];
            }
          
            acc[quest_id].push(attributes);
          
            return acc;
        }, {});

        const {eligibleQuestions: operatedQuestions,  questionMetaData: questionMetaData} 
        = await applyQuestionOperations(form_questions.result, parseInt(patientID), formName, optionsDictionary);

        const answerAssignedQuestions: Question[] = [];
        for (const question of operatedQuestions) {
            const updatedQuestion = await evaluateDynamicQuestions(question, getClinician(), patientData, formName);
            answerAssignedQuestions.push(updatedQuestion);
        }

        const questionResponses = {};
        answerAssignedQuestions.forEach((question) => {
            const questionId = question.question_id;
          
            questionResponses[questionId] = {
              question_id: questionId,
              comment: null,
              opt_response: null,
              date_response: null,
              int_response: null,
              text_response: null,
              opt_answer: question.question_answer_opt,
              int_answer: question.question_answer_integer,
              date_answer: question.question_answer_date,
              text_answer: question.question_answer_text,
              repquest_num: question.formquest_num,
            };
        });

        set((state:any) => ({
            formName: formName,
            numQuestions: answerAssignedQuestions.length,
            questions: answerAssignedQuestions,
            question_options: optionsDictionary,
            question_responses: questionResponses,
            question_metadata: questionMetaData,
            clinID: getClinician().clin_id,
            patientID: patientData?.patient_id,
        }));
    },

    storeQuestionOption:async (questID: int, responseOptID: int) => {
        set((state:any) => ({
            question_responses:{
                ...state.question_responses,
                [questID] : { 
                    ...state.question_responses[questID],
                    opt_response: responseOptID,
                }
            }
        }));
    },

    storeQuestionText:async (questID: int, responseText: Text) => {
        set((state:any) => ({
            question_responses:{
                ...state.question_responses,
                [questID] : {
                    ...state.question_responses[questID],
                    text_response: responseText,
                } 
            }
        }));
    },

    storeQuestionDate:async (questID: int, responseDate: Date) => {
        set((state:any) => ({
            question_responses:{
                ...state.question_responses,
                [questID] : {
                    ...state.question_responses[questID],
                    date_response: responseDate,
                }
            } 
        }));
    },

    storeQuestionInt:async (questID: int, responseInt: int) => {
        set((state:any) => ({
            question_responses:{
                ...state.question_responses,
                [questID] : {
                    ...state.question_responses[questID],
                    int_response: responseInt,
                }
            } 
        }));
    },

    addQuestionComment:async (questID:int, doctorComment: Text) => {
        set((state:any) => ({
            question_responses:{
                ...state.question_responses,
                [questID] : {
                    ...state.question_responses[questID],
                    comment: doctorComment,
                } 
            }
        }));
    },

    formSave:async () => {
        const formName = await get().formName;
        const clinID = await get().clinID;
        const patientID = await get().patientID;

        const fromResponseCreation = await supabaseService.create_form_response(clinID, formName, patientID);
        const formRespID = fromResponseCreation.result;

        const formQuestionResponses = get().question_responses;
        const responsesArray = Object.values(formQuestionResponses)
        for (const questRep of responsesArray) {
            const typedQuestRep = questRep as any;
            await supabaseService.create_question_response(
                formRespID,
                typedQuestRep.repquest_num,
                typedQuestRep.question_id,
                typedQuestRep.comment,
                typedQuestRep.opt_response,
                typedQuestRep.date_response,
                typedQuestRep.int_response,
                typedQuestRep.text_response,
                typedQuestRep.opt_answer,
                typedQuestRep.int_answer,
                typedQuestRep.date_answer, 
                typedQuestRep.text_answer
            );
        }

        const questionMetaData: {[key: int]: questionMetaData} = await get().question_metadata;
        const questionMetaDataArray = Object.values(questionMetaData)
        supabaseService.setTable("QuestionMetadata");
        for (const metaData of questionMetaDataArray){
            const state = [{
                question_id: metaData.question_id,
                repform_id: formRespID,
                questmeta_key: metaData.questmeta_key,
                questmeta_value: metaData.questmeta_value
            }];
            await supabaseService.add(state);
        }
    },

    clear: () =>{
        // Double check if its dashboard
        window.location.href = "dashboard";
    }
}));

// Change any and change type
async function evaluateDynamicQuestions (question: Question, clinData, patientData, formName) {
    if (question.question_dynamic && question.question_answer_text != null){
        const scope = {
            getCurrentDate: new Date(),
            getClinicianData: clinData,
            getPatientData: patientData,
            getPrevMetaData: (await supabaseService.get_question_metadata(formName, patientData.patient_id, question.question_id)).result
        };

        const evalExpr = await evaluate(question.question_answer_text, scope);

        // converts the question back to be non-dynamic
        question.question_dynamic = false;
        question.question_answer_text = null;

        if (question.typequest_name.startsWith('ANSWER_INT')) {
            question = {
                ...question,
                question_answer_integer: evalExpr
            };
        } else if (question.typequest_name.startsWith('ANSWER_DATE')) {
            question = {
                ...question,
                question_answer_date: evalExpr
            }
        } else if (question.typequest_name.startsWith('ANSWER_TEXT')) {
            question = {
                ...question,
                question_answer_text: evalExpr
            }
        } else if (question.typequest_name.startsWith('ANSWER_OPT')) {
            question = {
                ...question,
                question_answer_opt: evalExpr
            }
        }
    } 
    return question
};

// Fix input parameters
async function applyQuestionOperations(questions: Question[], patientID: int, formName: string, optionsDictionary: any){
    const eligibleQuestions: Question[] = [];
    supabaseService.setTable("QuestionConditionOperations");
    const questionMetaData: {[key: int]: questionMetaData} = {}

    for (const question of questions){
        const scope = {
            returnQuestion: true,
            isFirstForm: !((await supabaseService.has_form_response(patientID, formName)).result),
            setQuestionMetaData: (metaKey: int|null = null, metaValue: string|null = null) => (
                questionMetaData[question.question_id] = {
                    question_id: question.question_id,
                    questmeta_key: metaKey,
                    questmeta_value: metaValue
                }
            ),
            getRandomOptionID: () => {
                // Add catch incase its empty
                const questOptions =  optionsDictionary[question.question_id];
                const randomIndex =  Math.floor(Math.random() * questOptions.length);
                return questOptions[randomIndex].opt_id;
            },
            randomiseQuestionOptions: () => {
                // For a particular question it randomises the the order by swithcing the optquest_num randomly
                const questOptions =  optionsDictionary[question.question_id];
                const optionNums = questOptions.map((option) => option.optquest_num);
                const randomisedOptionNums = optionNums.sort(() => Math.random() - 0.5);
                for (const [index, option] of questOptions.entries()){
                    option.optquest_num = randomisedOptionNums[index];
                }
            }
        };
        const questionOpResponse:supabaseResponse = await supabaseService.fetchAllBy('question_id', question.question_id.toString(), 'qco_condtion, qco_operations');

        if (questionOpResponse.status && Array.isArray(questionOpResponse.result) && questionOpResponse.result.length > 0 ){
            const questionOpertations:Operations[] = questionOpResponse.result;
            for (const conditOp of questionOpertations){
                const evalCondition = await evaluate(conditOp.qco_condtion, scope);
                if (evalCondition){
                    for (const operation of conditOp.qco_operations){
                        await evaluate(operation, scope);
                    }
                }
            }
        }
        if (scope.returnQuestion){
            eligibleQuestions.push(question);
        }
    }

    return {eligibleQuestions, questionMetaData}
}

type FormQuestionResult = {
    status: boolean;
    result: Question[];
};

type supabaseResponse = {
    status: boolean;
    result: Operations[] | PostgrestError;
}

type Question = {
    question_id: number;
    formquest_num: number;
    typequest_name: string;
    question_dynamic: boolean;
    question_text: string;
    question_answer_text: string|null;
    question_answer_integer: number|null;
    question_answer_date: Date|null;
    question_answer_opt: number|null
};

type questionMetaData = {
    question_id:  int;
    questmeta_key: int|null;
    questmeta_value: string|null;
}

type Patient = {
    patient_id: number,
    patient_fname: string,
    patient_lname: string,
    patient_DOB: Date,
    patient_incare: boolean
}

type Operations = {
    qco_condtion: string;
    qco_operations: string[]
}

export default useFormStore;