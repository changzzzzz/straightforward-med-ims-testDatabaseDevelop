import { useState, useEffect } from "react";
import { Form, Input, Button, AutoComplete, Modal, Space, ConfigProvider } from 'antd';
import { supabase } from "src/supabaseClient.ts";
import App from "../../components/ABS/form/form.tsx";
import useFormStore from '@/ims/store/store.form';
import { useLocation } from 'react-router-dom';

const ABS = () => {
  document.documentElement.style.setProperty('--color-primary-100', 'hsl(22, 83%, 79%)');
  document.documentElement.style.setProperty('--color-primary-200', 'hsl(22, 83%, 79%)');
  document.documentElement.style.setProperty('--color-primary-300', '#fa9257');
  document.documentElement.style.setProperty('--color-primary-400', '#f86c1c');
  document.documentElement.style.setProperty('--color-primary-400--active', 'hsl(22, 83%, 79%)');

  document.documentElement.style.setProperty('--color-light-100--hover', 'hsl(22, 83%, 79%)');
  document.documentElement.style.setProperty('--color-light-200--hover', 'hsl(22, 83%, 79%)');
  document.documentElement.style.setProperty('--color-light-300--hover', 'hsl(22, 83%, 79%)');
  document.documentElement.style.setProperty('--color-light-400--hover', 'hsl(22, 83%, 79%)');
  document.documentElement.style.setProperty('--color-light-400', '#fdcbaf');

  document.documentElement.style.setProperty('--color-primary-400--hover', '#cd4e06');
  document.documentElement.style.setProperty('--color-tertiary-400', 'hsl(22, 83%, 79%)');

  const [hasStarted, setHasStarted] = useState(false);
  const [form] = Form.useForm();
  const [suggestions, setSuggestions] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      let { data, error } = await supabase.from('Patient').select('*');
      if (error) {
        console.error("Error fetching patients:", error);
      } else {
        setPatientsData(data);
      }
    };

    fetchPatients();
  }, []);

  const onStartTest = (values: any) => {
    setPatientDetails(values);
    setHasStarted(true);
  };

  const searchPatient = (searchText: string) => {
    console.log("searchPatient");
    if (searchText.trim() === '') {
      setSuggestions([]);
      return;
    }
  
    const filteredPatients = patientsData.filter(patient => 
      `${patient.patient_fname} ${patient.patient_lname}`.toLowerCase().includes(searchText.toLowerCase())
    );
  
    setSuggestions(filteredPatients);
  }
  const [patientId, setpatientId] = useState(0);
  
  const onSelectPatient = (value: string) => {
    console.log("onSelectPatient");
    const selectedPatient = patientsData.find(patient => 
      `${patient.patient_fname} ${patient.patient_lname}` === value.split(' (')[0]
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
  if(passedValue == null){
    return (
      <>
        <h4>ABS Form </h4>
        {hasStarted ? (
          <App patientInfo={patientDetails}/>
        ) : (
          <Form form={form} onFinish={onStartTest} layout='vertical' style={{ maxWidth: 500, margin: 'auto' }}>
            <Form.Item>
              <AutoComplete
                options={suggestions.map(patient => ({ value: `${patient.patient_fname} ${patient.patient_lname} (ID: ${patient.patient_id})` }))}
                placeholder="Search for patient by name..."
                // defaultValue={passedValue.patient.patient_fname + " " +passedValue.patient.patient_lname}
                onSelect={onSelectPatient}
                onSearch={searchPatient}
                style={{ width: '100%', marginBottom: '20px' }}
              />
            </Form.Item>
            <Form.Item name="patientName" rules={[{ required: true, message: 'Please enter patient\'s name' }]}
              // initialValue={passedValue.patient.patient_fname + " " +passedValue.patient.patient_lname} 
              >
              <Input placeholder="Patient's Name" />
            </Form.Item>
  
            <Form.Item name="patientId" rules={[{ required: true, message: 'Please enter patient\'s ID' }]}
              // initialValue = {passedValue.patient.patient_id}
              >
              <Input placeholder="Patient's ID" />
            </Form.Item>
  
            <Form.Item name="patientDOB" rules={[{ required: true, message: 'Please enter patient\'s Date of Birth' }]}
              // initialValue = {passedValue.patient.patient_DOB}
              >
              <Input placeholder="Patient's Date of Birth" />
            </Form.Item>
  
            <Form.Item name="patientInCare" rules={[{ required: true, message: 'Please enter if the patient is in care' }]}
              // initialValue = {passedValue.patient.patient_incare}
              >
              <Input placeholder="Is Patient in Care?" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ color: 'black', backgroundColor: 'lightgrey', borderColor: 'grey', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' }}>
                 Start Test
              </Button>
            </Form.Item>
          </Form>
        )}
      </>
    );
  }
  else{
    return (
      <>
        <h4>ABS Form </h4>
        {hasStarted ? (
          <App patientInfo={patientDetails}/>
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
            <Form.Item name="patientName" rules={[{ required: true, message: 'Please enter patient\'s name' }]}
              initialValue={passedValue.patient.patient_fname + " " +passedValue.patient.patient_lname} 
              >
              <Input placeholder="Patient's Name" />
            </Form.Item>
  
            <Form.Item name="patientId" rules={[{ required: true, message: 'Please enter patient\'s ID' }]}
              initialValue = {passedValue.patient.patient_id}
              >
              <Input placeholder="Patient's ID" />
            </Form.Item>
  
            <Form.Item name="patientDOB" rules={[{ required: true, message: 'Please enter patient\'s Date of Birth' }]}
              initialValue = {passedValue.patient.patient_DOB}
              >
              <Input placeholder="Patient's Date of Birth" />
            </Form.Item>
  
            <Form.Item name="patientInCare" rules={[{ required: true, message: 'Please enter if the patient is in care' }]}
              initialValue = {passedValue.patient.patient_incare}
              >
              <Input placeholder="Is Patient in Care?" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ color: 'black', backgroundColor: 'lightgrey', borderColor: 'grey', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' }}>
                 Start Test
              </Button>
            </Form.Item>
          </Form>
        )}
      </>
    );
  }
  
} 

export default ABS;
