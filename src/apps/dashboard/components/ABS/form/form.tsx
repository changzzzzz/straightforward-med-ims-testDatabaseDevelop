import React, { useEffect,useState } from 'react';
import {
  Button,
  Form,
  Radio,
  notification,
  Card,
  Space,
  Input
} from 'antd';
import useMedicineStore from "./../../../../../libs/store/store.medicine";
import supabaseService from "./../../../../../libs/services/supabase";
import { supabase } from "../../../../../supabaseClient";
import useFormStore from '@/ims/store/store.form';
import { useForm } from 'antd/es/form/Form';
import type { RadioChangeEvent, } from 'antd';
/**
 * A tpe definition to specify sice of the form using Ant designs
 */
type SizeType = Parameters<typeof Form>[0]['size'];




const App: React.FC = () => {
  const [showSummary, setShowSummary] = useState(false);
  let [totalScore, setTotalScore] = useState<number | null>(null);
  const [doctorComments, setDoctorComments] = useState({});
  

  const formLoad = useFormStore((state:any) => state.formLoad);
  const questionsStored = useFormStore((state:any) => state.questions);
  const optionsStored = useFormStore((state:any) => state.question_options);
  const responsesStored = useFormStore((state:any) => state.question_responses);
  const saveResponse = useFormStore((state:any) => state.formSave);
  const storeTextAnswer = useFormStore((state:any) => state.storeQuestionText);
  const storeOptionAnswer = useFormStore((state:any) => state.storeQuestionOption)
  const addquestioncomment = useFormStore((state:any) => state.addQuestionComment)


  //useEffect receive asynchronous function
  useEffect(() => {
    const fetchData = async() => {
      await formLoad('ABS');
      console.log(questionsStored);
      console.log(responsesStored);
    } 
    fetchData();
  },[])
     


 const handleSubmit = async (event) => {
  // event.preventDefault();

  const allQuestions = questionsStored;
  const questionResponses = responsesStored;

  // Check if all questions have been answered
  let allQuestionsAnswered = true;
  for (let i = 0; i < allQuestions.length; i++) {
    console.log(allQuestions.length)
    const question = allQuestions[i];
    const questionId = question.question_id;

    const response = questionResponses[questionId];

    if (response.opt_response !== null) {
      totalScore += response.opt_response;
    }
    
    if (
      response.opt_response === null &&
      response.date_response === null &&
      response.int_response === null &&
      response.text_response === null
    ) {
      allQuestionsAnswered = false;
      break;
    }
  }

  if (allQuestionsAnswered) {
    setShowSummary(true);
    setTotalScore(totalScore);
    // If all questions have been answered, save the form.
    await saveResponse();
  } else {
    // Handle the case where not all questions are answered.
    // You can show an alert or update the UI.
    notification.error({
      message: 'Incomplete Form',
      description: 'Please answer all questions before submitting.',
      });
  }
};

// Inside your component
const textAnswerChange = (questID, event) => {
  storeTextAnswer(questID, event.target.value);
};



  

/**   RADIO BUTTON OF OUTLINE TYPE
 * 
 * @returns <Radio.Group
              buttonStyle='outline'
              onChange={onChange}
              size='large'
              style={{ fontWeight: 'bold'}}
            >
              {options.map((opt: any) => (
                <Radio.Button key={opt.opt_value} value={opt.opt_value}>
                  {opt.opt_text}
                </Radio.Button>
              ))}
            </Radio.Group>
 */
// This is where you define or import your useFormStore
// ...

useEffect(() => {
  console.log('Responses changed:', responsesStored);
}, [responsesStored]);

const handleOptionChange = (questionId: number, selectedOption: any) => {
  storeOptionAnswer(questionId, selectedOption);
};

const handleDoctorCommentsChange = (questionId, comment) => {
  setDoctorComments({ ...doctorComments, [questionId]: comment });
};


const addDoctorComment = (questionId: number) => {
  addquestioncomment(questionId, doctorComments[questionId]);
  notification.success({
    message: 'Comment Added',
    description: 'Your comment has been added.',
  });
}

const renderQuestions = () => {
  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      {questionsStored.map((question: any, index: number) => {
        const options = optionsStored[question.question_id] || [];
        return (
          <Card
            key={index}
            title={`Question ${question.question_id}`}
            size="default"
            style={{ width: '100%', marginBottom: '20px', backgroundColor: "#ffffff" }}
          >
            <Card>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {question.question_text}
              </p>
              <Radio.Group
                optionType="button"
                // buttonStyle="solid"
                options={options.map((opt: any) => ({
                label: opt.opt_text,
                value: opt.opt_value,
                }))}
                onChange={(e) => handleOptionChange(question.question_id, e.target.value)}
              />
            </Card>
            <Card>
              <Input.TextArea
                rows={1} // You can adjust the number of rows as needed
                placeholder="Doctor's Comments..."
                onChange={(e) => handleDoctorCommentsChange(question.question_id, e.target.value)}
              />
              <Button type="default"
                style={{ width: '200px' }} 
                onClick={() => addDoctorComment(question.question_id)}>
                Submit Comment
              </Button>
            </Card>
          </Card>
        );
      })}
    </Space>
  );
};


/**
 * Shows the summary page and the contents to be displayed specifically on that page
 */
if (showSummary) {
  return (
    <div
    style={{ maxWidth: 900, margin: '0 auto' }}
    >
      <h1>Your Score: {totalScore}/56</h1>
      <h4> Scale: </h4>
      <p>0-21: Normal Behaviour</p>
      <p>22-28: Mild Agitation</p>
      <p>29-35: Moderate Agitation</p>
      <p>36-56: Severe Agitation</p>

      <br />
      <h2>Summary of Answers</h2>
      <p> Each score is out of 4.</p>
      <br />
      {questionsStored.map((question, index) => (
      <div key={index}>
        <strong>{question.question_id}. {question.question_text}: {responsesStored.opt_response} </strong>
        {responsesStored[question.question_id]?.opt_response ? (
          <span>
            {
              // Map option value to option text
              optionsStored[question.question_id].find(
                (opt) => opt.opt_value === responsesStored[question.question_id].opt_response
              )?.opt_text
            }
          </span>
        ) : (
          "Not answered"
        )}
      </div>
      ))}
    </div>
  );
}

/**
 * To edit the form and have numeric values for multiple choice options
 */
return (
  <Form layout="vertical" style={{ width: '90%', maxWidth: 900, margin: '0 auto' }}>
    {renderQuestions()}
    <Form.Item>
      <Button
        type="primary"
        style={{ marginTop: 50, backgroundColor: '#ffffff', color: '#ffffff', fontSize: 20, paddingBottom: 40}}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Form.Item>
  </Form>
);
};


export default App;