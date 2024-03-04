import { Button, Table, AutoComplete, Modal, List } from "antd";
import { useState, useEffect } from "react";
import { supabase } from "src/supabaseClient";

const SearchAndHistoryPage = () => {
    const [searchText, setSearchText] = useState("");
    const [patientList, setPatientList] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [testHistory, setTestHistory] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [questionsResponses, setQuestionsResponses] = useState([]);
    const [showTable, setShowTable] = useState(false);
    

    useEffect(() => {
        if (selectedPatient) {
            fetchPatientHistory();
        }
    }, [selectedPatient]);

    useEffect(() => {
        if (searchText !== "") {
            searchPatients();
        }
    }, [searchText]);
    

    const searchPatients = async () => {
        let { data, error } = await supabase
            .from('Patient')
            .select('*')
            .ilike('patient_fname', `%${searchText}%`);

        if (data) {
            // @ts-expect-error
            setPatientList(data);
        }
        if (error) {
            console.error("Error fetching data:", error);
        }
    };

    const onSearchPatientHistory = async () => {
        setShowTable(true); // Set showTable to true when the button is clicked
        await fetchPatientHistory();
    };

    const onSelectPatient = (value) => {
        // @ts-expect-error
        const patient = patientList.find(p => `${p.patient_fname} ${p.patient_lname}` === value);
        // @ts-expect-error
        setSelectedPatient(patient);
        setTestHistory([]); // Clear previous test history
    };
    

    const fetchPatientHistory = async () => {
        if (!selectedPatient) return;
    
        // First, fetch the FormResponse data
        const { data: responseData, error: responseError } = await supabase
            .from('FormResponse')
            .select(`
                repform_id,
                repform_creation,
                Form (form_name),
                Clinician (clin_fname, clin_lname)
            `)
            // @ts-expect-error
            .eq('patient_id', selectedPatient.patient_id);
    
        if (responseError) {
            console.error("Error fetching test history:", responseError);
            return;
        }
    
        if (responseData) {
            // For each form response, fetch the scores of each question and calculate the cumulative score
            const adjustedData = await Promise.all(responseData.map(async (formResponse) => {
                // Fetch the scores for each question in the form response
                const { data: questionData, error: questionError } = await supabase
                    .from('Questions') // Adjust this line according to your actual table name
                    .select('score')
                    // @ts-expect-error
                    .eq('form_id', formResponse.Form.form_id); // Adjust this line according to your actual column names
                
                if (questionError) {
                    console.error("Error fetching question scores:", questionError);
                    return formResponse; // Return the original formResponse if fetching scores fails
                }
                
                // Calculate the cumulative score
                const cumulativeScore = questionData.reduce((total, question) => total + question.score, 0);
                return {
                    ...formResponse,
                    score: cumulativeScore, // Add the calculated cumulative score
                };
            }));
    
            // Set the adjusted data as the testHistory state
            // @ts-expect-error
            setTestHistory(adjustedData);
        }
    };
    
    

    const fetchQuestionAndResponse = async (repformId) => {
        try {
            if (typeof repformId === 'undefined' || repformId === null) {
                throw new Error("repformId is undefined or null");
            }
      
            const { data, error } = await supabase.rpc('get_test_details', { p_repform_id: repformId });
      
            if (error) {
                throw error;
            }
      
            if (data) {
                const formattedData = data.map((row) => ({
                    question: row.question_text,
                    response: row.response || "N/A",
                    answer: row.answer || "N/A",
                    comment: row.repquestion_comment || "N/A",
                    score: row.score || "N/A", // Include the score
                }));
                setQuestionsResponses(formattedData);
            }
        } catch (error) {
            console.error("Error fetching question and response details:", error);
        }
    };
    
    

    const handleRowClick = (record) => {
        console.log("Record:", record);
        setSelectedTest(record);
        fetchQuestionAndResponse(record.repform_id);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedTest(null);
        setQuestionsResponses([]);
    };

    const columns = [
        {
            title: 'Patient Name',
            dataIndex: 'patient_name',
            key: 'patient_name',
            // @ts-expect-error
            render: (_, record) => `${selectedPatient.patient_fname} ${selectedPatient.patient_lname}`,
        },
        {
            title: 'Clinician Name',
            dataIndex: 'clinician_name',
            key: 'clinician_name',
            render: (_, record) => `${record.Clinician.clin_fname} ${record.Clinician.clin_lname}`,
        },
        {
            title: 'Form Type',
            dataIndex: 'form_name',
            key: 'form_name',
            render: (_, record) => record.Form.form_name,
        },
        {
            title: 'Created Time',
            dataIndex: 'repform_creation',
            key: 'repform_creation',
            render: (repform_creation) => {
                const date = new Date(repform_creation);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                
                return `${year}-${month}-${day} ${hours}:${minutes}`;
            },
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    style={{ 
                        color: 'green !important', 
                        backgroundColor: 'white', 
                        borderColor: 'limegreen !important',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '40px',  // adjust as per your need
                    }} 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(record);
                    }}
                >
                    Open Test
                </Button>
            ),
        },
    ];


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px' }}>
            <h2 style={{ fontSize: '2em', marginBottom: '20px' }}>Search for a patient</h2> 
            <AutoComplete
                style={{ width: 350, marginTop: '1px' }} 
                onSearch={setSearchText}
                onSelect={onSelectPatient}
                // @ts-expect-error
                options={patientList.map(patient => ({ value: `${patient.patient_fname} ${patient.patient_lname}` }))}
                placeholder="Search by name"
            />

            {selectedPatient && (
                <div style={{ marginTop: '20px' }}>
                    {/* @ts-expect-error */}
                    <p><strong>Name:</strong>{selectedPatient.patient_fname} {selectedPatient.patient_lname}</p>
                    {/* @ts-expect-error */}
                    <p><strong>DOB:</strong> {selectedPatient.patient_DOB}</p>
                    {/* @ts-expect-error */}
                    <p><strong>In Care:</strong> {selectedPatient.patient_incare ? "Yes" : "No"}</p>

                    <Button onClick={onSearchPatientHistory} style={{ marginTop: '20px' }}>Search Patient History</Button>

                    {showTable && testHistory.length > 0 && (
                        <Table
                            dataSource={testHistory}
                            columns={columns}
                            rowKey="repform_id"
                            style={{ marginTop: '20px' }}
                            onRow={(record) => {
                                return {
                                    onClick: () => handleRowClick(record),
                                };
                            }}
                        />
                    )}

                    <Modal
                        //@ts-expect-error
                        title={`Test Details for ${selectedPatient.patient_fname} ${selectedPatient.patient_lname}`}
                        visible={isModalVisible}
                        onCancel={handleModalClose}
                        footer={null}
                        width={800}
                    >
    
                        {questionsResponses.length > 0 && (
                            <p>
                                <strong>Total Score:</strong>{" "}
                                {/* @ts-expect-error */}
                                {questionsResponses.every(question => question.score === "N/A")
                                    ? "Not Available"
                                    //@ts-expect-error
                                    : questionsResponses.reduce((total, question) => total + (Number(question.score) || 0), 0)}
                            </p>
                        )}
                        <Table
                            dataSource={questionsResponses}
                            columns={[
                                { title: 'Question', dataIndex: 'question', key: 'question' },
                                { title: 'Response', dataIndex: 'response', key: 'response' },
                                { title: 'Answer', dataIndex: 'answer', key: 'answer' },
                                { title: 'Comment', dataIndex: 'comment', key: 'comment' },
                                { title: 'Score', dataIndex: 'score', key: 'score' },
                            ]}
                            rowKey="question"
                        />
                    </Modal>


                </div>
            )}
        </div>
    );
};

export default SearchAndHistoryPage;

