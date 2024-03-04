import React, { useState, useEffect } from 'react';
import QuestionnaireForm from "../../components/WPTAS/form/form.tsx";
import { Form, Input, Button, AutoComplete } from 'antd';
import { supabase } from "src/supabaseClient.ts";
import { useLocation } from 'react-router-dom';

const WPTAS = () => {
  document.documentElement.style.setProperty('--color-primary-100', '#d2d9ec');
  document.documentElement.style.setProperty('--color-primary-200', '#d2d9ec');
  document.documentElement.style.setProperty('--color-primary-300', '#5c76b9');
  document.documentElement.style.setProperty('--color-primary-400', '#3e5590');
  document.documentElement.style.setProperty('--color-primary-400--active', '#d2d9ec');

  document.documentElement.style.setProperty('--color-light-100--hover', '#d2d9ec');
  document.documentElement.style.setProperty('--color-light-200--hover', '#d2d9ec');
  document.documentElement.style.setProperty('--color-light-300--hover', '#d2d9ec');
  document.documentElement.style.setProperty('--color-light-400--hover', '#d2d9ec');
  document.documentElement.style.setProperty('--color-light-400', '#cbd3e9');

  document.documentElement.style.setProperty('--color-primary-400--hover', '#344778');
  document.documentElement.style.setProperty('--color-tertiary-400', '#8b9dcd');

  const [hasStarted, setHasStarted] = useState(false);
  const [form] = Form.useForm();
  const [suggestions, setSuggestions] = useState([]);
  const [patientsData, setPatientsData] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from('Patient').select('*');
      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }
      setPatientsData(data);
    };

    fetchPatients();
  }, []);

  const onStartTest = (values: any) => {
    console.log('Patient and Doctor Info:', values);
    setHasStarted(true);
  };

  const searchPatient = (searchText: string) => {
    if (searchText.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filteredPatients = patientsData.filter(patient =>
      `${patient.patient_fname} ${patient.patient_lname}`.toLowerCase().includes(searchText.toLowerCase())
    );

    setSuggestions(filteredPatients);
  }

  const onSelectPatient = (value: string) => {
    const selectedPatient = patientsData.find(patient =>
      `${patient.patient_fname} ${patient.patient_lname}` === value.split(' (ID: ')[0]
    );
    if (selectedPatient) {
      form.setFieldsValue({
        patientName: `${selectedPatient.patient_fname} ${selectedPatient.patient_lname}`,
        patientId: selectedPatient.patient_id,
        patientDOB: selectedPatient.patient_DOB,
        patientInCare: selectedPatient.patient_incare 
      });
      localStorage.setItem('PatientID', selectedPatient.patient_id.toString());

    }
  }
  const location = useLocation();
  const passedValue = location.state || null ;
  const storePassedValue = ()=>{
    localStorage.setItem('PatientID', passedValue.patient.patient_id.toString());
  }
  if(passedValue != null){
    return (
      <>
        <h4>WPTAS Form {passedValue.patient.patient_fname} {passedValue.patient.patient_lname}</h4>
        {hasStarted ? (
          <QuestionnaireForm />
        ) : (
          <Form form={form} onFinish={onStartTest} layout='vertical' style={{ maxWidth: 500, margin: 'auto' }}>
            <Form.Item>
              <AutoComplete
                options={suggestions.map(patient => ({ value: `${patient.patient_fname} ${patient.patient_lname} (ID: ${patient.patient_id})` }))}
                placeholder="Search for patient by name..."
                defaultValue={passedValue.patient.patient_fname + " " +passedValue.patient.patient_lname}
                onSelect={onSelectPatient}
                onSearch={searchPatient}
                style={{ width: '100%', marginBottom: '20px' }}
              />
            </Form.Item>
  
            <Form.Item
              name="patientName"
              rules={[{ required: true, message: 'Please enter patient\'s name' }]}
              initialValue={passedValue.patient.patient_fname + " " +passedValue.patient.patient_lname} >
              <Input placeholder="Patient's Name" />
            </Form.Item>
  
            <Form.Item
              name="patientId"
              rules={[{ required: true, message: 'Please enter patient\'s ID' }]}
              initialValue = {passedValue.patient.patient_id}>
              <Input placeholder="Patient's ID" />
            </Form.Item>
  
            <Form.Item 
              name="patientDOB" 
              rules={[{ required: true, message: 'Please enter patient\'s Date of Birth' }]}
              initialValue = {passedValue.patient.patient_DOB}>        
              <Input placeholder="Patient's Date of Birth" />
            </Form.Item>
  
            <Form.Item 
              name="patientInCare" 
              rules={[{ required: true, message: 'Please enter if the patient is in care' }]}
              initialValue = {passedValue.patient.patient_incare}>
              <Input placeholder="Is Patient in Care?" />
            </Form.Item>
  
            {/* <Form.Item
              name="doctorId"
              rules={[{ required: true, message: 'Please enter doctor\'s ID' }]}
            >
              <Input placeholder="Doctor's ID" />
            </Form.Item> */}
  
            <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ 
                  color: 'black', 
                  backgroundColor: 'lightgrey',
                  borderColor: 'grey', 
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' 
              }}>
               Start Test
              </Button>
            </Form.Item>
          </Form>
        )}
      </>
    );
  }else{
    return (
      <>
        <h4>WPTAS Form </h4>
        {hasStarted ? (
          <QuestionnaireForm />
        ) : (
          <Form form={form} onFinish={onStartTest} layout='vertical' style={{ maxWidth: 500, margin: 'auto' }}>
            <Form.Item>
              <AutoComplete
                options={suggestions.map(patient => ({ value: `${patient.patient_fname} ${patient.patient_lname} (ID: ${patient.patient_id})` }))}
                placeholder="Search for patient by name..."
                onSelect={onSelectPatient}
                onSearch={searchPatient}
                style={{ width: '100%', marginBottom: '20px' }}
              />
            </Form.Item>
  
            <Form.Item
              name="patientName"
              rules={[{ required: true, message: 'Please enter patient\'s name' }]}>
              <Input placeholder="Patient's Name" />
            </Form.Item>
  
            <Form.Item
              name="patientId"
              rules={[{ required: true, message: 'Please enter patient\'s ID' }]}>
              <Input placeholder="Patient's ID" />
            </Form.Item>
  
            <Form.Item 
              name="patientDOB" 
              rules={[{ required: true, message: 'Please enter patient\'s Date of Birth' }]}>        
              <Input placeholder="Patient's Date of Birth" />
            </Form.Item>
  
            <Form.Item 
              name="patientInCare" 
              rules={[{ required: true, message: 'Please enter if the patient is in care' }]}>
              <Input placeholder="Is Patient in Care?" />
            </Form.Item>
  
            {/* <Form.Item
              name="doctorId"
              rules={[{ required: true, message: 'Please enter doctor\'s ID' }]}
            >
              <Input placeholder="Doctor's ID" />
            </Form.Item> */}
  
            <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ 
                  color: 'black', 
                  backgroundColor: 'lightgrey',
                  borderColor: 'grey', 
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' 
              }}>
               Start Test
              </Button>
            </Form.Item>
          </Form>
        )}
      </>
    );
  }
  
}

export default WPTAS;
