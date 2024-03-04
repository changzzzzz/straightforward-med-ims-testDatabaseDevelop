import React, { useEffect, useState } from 'react';
import { Form, Radio, Input, Button, Row, Col, notification, Typography, Image, Card, Space, RadioChangeEvent, Switch } from 'antd';
import useFormStore from '@/ims/store/store.form';
const {Text} = Typography

const QuestionnaireForm: React.FC = () => {
  const [doctorComments, setDoctorComments] = useState({});

  const [selectedOptions, setSelectedOptions] = useState({});
  const [showWPTASSummary, setshowWPTASSummary] = useState(false);

  const formLoad = useFormStore((state:any) => state.formLoad);
  const questionsStored = useFormStore((state:any) => state.questions);
  const optionsStored = useFormStore((state:any) => state.question_options);
  const responsesStored = useFormStore((state:any) => state.question_responses);
  const saveResponse = useFormStore((state:any) => state.formSave);
  const storeTextAnswer = useFormStore((state:any) => state.storeQuestionText);
  const storeOptionAnswer = useFormStore((state:any) => state.storeQuestionOption)
  const storeIntAnswer = useFormStore((state:any) => state.storeQuestionInt)
  const questionMetaDataStored = useFormStore((state:any) => state.question_metadata)
  const addquestioncomment = useFormStore((state:any) => state.addQuestionComment)


  //useEffect receive asynchronous function
  useEffect(() => {
    const fetchData = async() => {
      await formLoad('WPTAS');
    } 
    fetchData();
  },[])

  useEffect(() => {
    console.log('Responses changed:', responsesStored);
  }, [responsesStored]);

  /**
   * Function to handle change of options for the image questions
   * @param question question object
   * @param imageOption the option that has been selected
   * @param value 
   */
  const handleRadioChange = (question, imageOption, value) => {
    storeOptionAnswer(question.question_id, imageOption.opt_id)
  };

  
  // Function to handle radio button change for a specific question
  const handleRadioChangeForQuestion = (question, value) => {
    setSelectedOptions({
      ...selectedOptions,
      [question.formquest_num]: value,
    });
    if (value == "yes") {
      if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_TEXT"){
        storeTextAnswer(question.question_id, questionsStored[question.formquest_num-1].question_answer_text);
      }
      if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_INT"){
        storeIntAnswer(question.question_id, questionsStored[question.formquest_num-1].question_answer_integer);
      }
      if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_OPT_TEXT"){
        storeOptionAnswer(question.question_id, questionsStored[question.formquest_num-1].question_answer_opt);
      }
      if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_OPT_IMG"){
        storeOptionAnswer(question.question_id, questionsStored[question.formquest_num-1].question_answer_opt);
      }
    } 
  };

  /**
   * Method to store responses when response is inputted for each question
   * @param question 
   * @param e 
   */
  const handleInputChange = (question, e) => {
    
    if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_TEXT"){
      console.log(storeTextAnswer(question.question_id, e))
      storeTextAnswer(question.question_id, e);
    }
    if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_INT"){
      console.log(storeIntAnswer(question.question_id, e))
      storeTextAnswer(question.question_id, e);
    }
    if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_OPT_TEXT"){
      console.log(storeTextAnswer(question.question_id, e))
      storeTextAnswer(question.question_id, e);
    }
    if (questionsStored[question.formquest_num-1].typequest_name == "ANSWER_OPT_IMG"){
      console.log(storeOptionAnswer(question.question_id, e))
      storeOptionAnswer(question.question_id, e);
    }
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

  /**
   * Function to render the Image Options for qeustion 8 and 10
   * @param question 
   * @param options 
   * @param handleRadioChange 
   * @returns 
   */
  const renderImageOptions = (question, options) => {

    // Sort options by optquest_num by a unique comparison function
    options.sort((op1, op2) => op1.optquest_num - op2.optquest_num);

    return (
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {options.map((option, index) => (
            <label key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                type="radio"
                name = "imageOption"
                value={option.opt_value}
                onChange={() => handleRadioChange(question, option, option.opt_value)}
              />
              <img src={option.opt_image} alt={option.opt_text} style={{ maxWidth: '100%', maxHeight: '100%' }}/>
            </label>
          ))}
        </div>
      </Card>
    );
  };

  /**
   * To generate questions for all of WPTAS Form
   * @param handleRadioChange 
   * @returns 
   */
  const renderWPTASQuestions = () => {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        {questionsStored.map((question: any, index: number) => {
          const options = optionsStored[question.question_id] || [];
          const currentAnswer = responsesStored[question.formquest_num]?.text || '';
          const questionId = question.formquest_num;
          const isInputVisible = selectedOptions[questionId] === 'no';

          let answerDisplay: null|string = null;

          if (question.typequest_name === "ANSWER_TEXT") {
            answerDisplay = question.question_answer_text;
          } else if (question.typequest_name === "ANSWER_INT") {
            answerDisplay = question.question_answer_integer.toString();
          } 
          else if ( question.typequest_name.startsWith("ANSWER_OPT")) {
            const answerOptID = question.question_answer_opt;
            const answerOpt = options.find((opt) => opt.opt_id === answerOptID);
            answerDisplay = answerOpt?.opt_text || null;
          }


          return (
            <Card key={index} title={`Question ${questionId}`} style={{ width: '100%' }}>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{question.question_text}</p>
              {answerDisplay && (
                <Text type="danger">Answer: {answerDisplay}</Text>
              )}
              {question.typequest_name === "ANSWER_OPT_IMG" ? (
                  // Render image options
                  renderImageOptions(question, options)
                ) : (
              <Card type="inner" title="Answered Correctly">
                <Radio.Group onChange={(e) => handleRadioChangeForQuestion(question, e.target.value)} style={{ marginTop: 16 }}>
                  <Radio.Button value="yes"> Yes </Radio.Button>
                  <Radio.Button value="no"> No </Radio.Button>
                </Radio.Group>
                {isInputVisible && (
                  <Input
                    placeholder="Enter your answer here"
                    style={{ marginTop: 16 }}
                    onChange={(e) => handleInputChange(question, e.target.value)}
                  />
                )}
              </Card>
              )}
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

  const handleSubmit = async (event) => {
  // Check if all questions have been answered
  const isFormValid = questionsStored.every((question) => {
    const response = responsesStored[question.question_id];
    return isResponseValid(response, question);
  });

    if (isFormValid) {
      setshowWPTASSummary(true);
      await saveResponse();
    } else {
      notification.error({
        message: 'Incomplete Form',
        description: 'Please answer all questions before submitting.',
      });  
    }
  };

  const isResponseValid = (response, question) => {
    if (!response) {
      return false;
    }
  
    switch (question.typequest_name) {
      case 'ANSWER_INT':
        return response.int_response !== null;
      case 'ANSWER_TEXT':
        return response.text_response !== null;
      case 'ANSWER_OPT_TEXT':
      case 'ANSWER_OPT_IMG':
        return response.opt_response !== null;
      default:
        return false;
    }
  };

  const SummaryPage = () => {
    let correctAnswers = 0;
  
    return (
      <div>
        <h1>Form Summary</h1>
        {questionsStored.map((question) => {
          const response = responsesStored[question.question_id];
          const isCorrect = isResponseCorrect(response, question);
  
          if (isCorrect) {
            correctAnswers++;
          }

          return (
            <Card key={question.question_id} title={`Question ${question.formquest_num}`}>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{question.question_text}</p>
              {response && renderResponse(response, question, optionsStored[question.question_id], isCorrect)}
            </Card>
          );
        })}
        <h2>Score: {correctAnswers} / {questionsStored.length}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {Object.keys(questionMetaDataStored).map((questionId) => {
            const questionMetaData = questionMetaDataStored[questionId];
            const question = questionsStored.find((q) => q.question_id === questionMetaData.question_id);
            const options = optionsStored[question.question_id];
            const nextOption = options.find((opt) => opt.opt_id === questionMetaData.questmeta_key);

            return (
              <Card key={question.question_id} title={`Remember for Next Time`} style={{ width: '30%', flex: '1', margin: '8px' }}>
                <p>{question.question_text}</p>
                <img
                  src={nextOption.opt_image}
                  alt={nextOption.opt_text}
                  style={{ maxWidth: '100%' }}
                />
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderResponse = (response, question, options, isCorrect) => {
    const color = isCorrect ? "green" : "red";
    return (
      <div>
        <p>
          Response: <Text style={{ color: color }}>{getResponseValue(response, question, options)}</Text>
        </p>
        <p>
          Expected Answer: <Text style={({color: 'blue'})}>{getExpectedAnswer(question, options)}</Text>
        </p>
      </div>
    );
  };

  const isResponseCorrect = (response, question) => {
    if (!response) {
      return false;
    }
    const responseValue = getResponseValue(response, question, optionsStored[question.question_id]);
    const expectedAnswer = getExpectedAnswer(question, optionsStored[question.question_id]);
    return responseValue === expectedAnswer;
  };

  const getResponseValue = (response, question, options) => {
    switch (question.typequest_name) {
      case 'ANSWER_INT':
        return response.int_response;
      case 'ANSWER_TEXT':
        return response.text_response;
      case 'ANSWER_OPT_TEXT':
        const selectedOption = options.find((opt) => opt.opt_id === response.opt_response);
        return selectedOption ? selectedOption.opt_text : 'N/A';
      case 'ANSWER_OPT_IMG':
        const selectedOptionImg = options.find((opt) => opt.opt_id === response.opt_response);
        return selectedOptionImg ? selectedOptionImg.opt_text : 'N/A';
      default:
        return 'N/A';
    }
  };

  const getExpectedAnswer = (question, options) => {
    if (question.typequest_name === 'ANSWER_OPT_TEXT' || question.typequest_name === 'ANSWER_OPT_IMG') {
      const expectedOption = options.find((opt) => opt.opt_id === question.question_answer_opt);
      return expectedOption ? expectedOption.opt_text : 'N/A';
    }
    if (question.typequest_name === "ANSWER_TEXT") {
      return question.question_answer_text;
    } else if (question.typequest_name === "ANSWER_INT") {
      return question.question_answer_integer;
    } else
      return  'N/A'
  };
  

  return (
    <div>
      <Form style={{ maxWidth: 700, margin: 'auto' }}>
        {showWPTASSummary ? (
          <SummaryPage />
        ) : (
          <>
            {renderWPTASQuestions()}
            <Form.Item>
              <Button 
                type="primary" 
                style={{ backgroundColor: '#00474f', color: '#ffffff' }} 
                onClick={handleSubmit}>
                Submit
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );
};

export default QuestionnaireForm;
