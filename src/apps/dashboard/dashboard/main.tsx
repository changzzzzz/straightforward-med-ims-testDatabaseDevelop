import  { useEffect,useState,PureComponent } from "react";
import { AreaChart,Area,RadialBarChart,RadialBar, PieChart, Pie, Cell,ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { supabase } from "../../../supabaseClient";
import { Calendar,Space, theme, Table, Button, CalendarProps} from 'antd';
import { Link, useNavigate } from "react-router-dom";
import * as React from 'react';


const Dashboard = () => {
  document.documentElement.style.setProperty('--color-primary-100', '#2b7c64');
  document.documentElement.style.setProperty('--color-primary-200', '#328f73');
  document.documentElement.style.setProperty('--color-primary-300', '#3aa686');
  document.documentElement.style.setProperty('--color-primary-400', '#41b995');
  document.documentElement.style.setProperty('--color-primary-400--active', '#33a381');

  document.documentElement.style.setProperty('--color-light-100--hover', '#edfffa');
  document.documentElement.style.setProperty('--color-light-100', '#c5cdca');
  document.documentElement.style.setProperty('--color-light-200', '#d3dad8');
  document.documentElement.style.setProperty('--color-light-300', '#e6eeec');
  document.documentElement.style.setProperty('--color-light-400', '#f4fffc');

  document.documentElement.style.setProperty('--color-primary-400--hover', '#266c57');
  document.documentElement.style.setProperty('--color-tertiary-400', '#4bd75e');
  // let data = [
  //   {
  //     stocks: [
  //       {
  //         title: "Stocks",
  //       },
  //     ],
  //   },
  // ];

  // Get data for Patient Incare and Patient
  const [patientIncare, setpatientIncare]= useState<any[]>([]);
  async function getPatientIncare() {
    try {
      const patientIncareList = await supabase
      .from('Patient')
      .select();

      if (patientIncareList != null) {
        setpatientIncare(patientIncareList.data); //never mind the error here
        console.log(patientIncareList.data); 
        console.log(patientIncareList.data?.length); 
        const newData = [...data];
        newData[1].count = patientIncareList.data.length;
        let countIncare = 0;
        for (let i = 0; i < patientIncareList.data.length; i++) {
          if(patientIncareList.data[i].patient_incare == true){
            countIncare++;
          }
        } 
        newData[0].count = countIncare;
        setData(newData);

    }
      return patientIncareList;
    } catch (error) {
      // Handle any other unexpected errors
      console.error('Unexpected error:', error);
    }
  }


  // Get data for Number of Response and Response Today
  async function getformResponse() {
    try {
      const today = new Date().toISOString().split('T')[0];
      // console.log("today",today); 
      const formResponse = await supabase
      .from('FormResponse')
      .select();
      
      console.log("formResponse",formResponse);
      console.log("formResponse.length",formResponse.data.length);

      const newData = [...data];
      let count = 0;
      if(formResponse != null){
        newData[2].count = formResponse.data.length;

        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        for (let i = 0; i < formResponse.data.length; i++) {
          const timestamp = formResponse.data[i].repform_creation;
          const dateParts = timestamp.split(" ")[0].split("-");
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10);
          const day = parseInt(dateParts[2], 10);
          if (year === currentYear && month === currentMonth && day === currentDay) {
            count ++;
          } else {
            
          }
        } 
      }

      
      newData[3].count = count;
      setData(newData);

    } catch (error) {
      // Handle any other unexpected errors
      console.error('Unexpected error:', error);
    }
  }

  let flag = true;
  // Get data for ABS and WPTAS Frequency Distribution Chart
  async function getTestScores() {
    if(flag == true){
      try {
        flag = false;
        const questionResponse = await supabase
        .from('QuestionResponse')
        .select();

        if (questionResponse != null) {
          // console.log("questionResponse.data",questionResponse.data); 
          // console.log(questionResponse.data?.length); 

          const accumulatedResults = questionResponse.data.reduce((accumulator, currentValue) => {
            const { repform_id, repquestion_opt_response } = currentValue;
            
              // Check if repform_id already exists in the accumulator
            if (!accumulator[repform_id]) {
              accumulator[repform_id] = 0;
            }
            // Accumulate the repquestion_opt_response value for the repform_id
            accumulator[repform_id] += repquestion_opt_response;
          
            return accumulator;
          }, {});
          console.log("accumulatedResults",accumulatedResults);

          const formResponse = await supabase
          .from('FormResponse')
          .select();
          // console.log("formResponse",formResponse.data);
          const newBarChartData = [...barChartData];

          // Add ABS WPTAS test number to graph data source, only update at beginning
          if(newBarChartData[0].ABS == 0){
            for (let repformId in accumulatedResults) {
              const accumulatedValue = accumulatedResults[repformId];
              const foundItem = formResponse.data.find(item => item.repform_id === 1);
              if (foundItem) {
                
                if(foundItem.form_id == 2){
                  newBarChartData[Math.floor(accumulatedValue / 5)].ABS += 1;}
                else{
                  newBarChartData[Math.floor(accumulatedValue / 5)].WPTAS += 1;}
                // update graph  
                setbarChartData(newBarChartData);
                // console.log("barChartData",barChartData);
              } else {
                console.log("element not found。");
              }
            }
            setbarChartData(newBarChartData);
          }
          
        }
        
      } catch (error) {
      // Handle any other unexpected errors
      console.error('Unexpected error:', error);
    }
    
  }
  }
  

  const [barChartData, setbarChartData] = useState([ 
    {
      name: '0',
      ABS: 0,
      WPTAS: 2,
    },
    {
      name: '5',
      ABS: 0,
      WPTAS: 3,
    },
    {
      name: '15',
      ABS: 0,
      WPTAS: 5,
    },
    {
      name: '20',
      ABS: 0,
      WPTAS: 6,
    },
    {
      name: '25',
      ABS: 0,
      WPTAS: 8,
    },
    {
      name: '30',
      ABS: 0,
      WPTAS: 7,
    },
    {
      name: '35',
      ABS: 0,
      WPTAS: 6,
    },
    {
      name: '40',
      ABS: 0,
      WPTAS: 3,
    },
    {
      name: '45',
      ABS: 0,
      WPTAS: 3,
    },
    {
      name: '50',
      ABS: 0,
      WPTAS: 1,
    },
    {
      name: '55',
      ABS: 0,
      WPTAS: 0,
    },
  ])


  // Patient list data source
  const filteredPatientIncare = patientIncare.filter(el => el.patient_incare === true);
  const dataSource = filteredPatientIncare.map((el: any, index: any) => {
    return {
      key: index,
      ...el,
    };
  });

  const barChartDailyData = [
    {
      name: 'Monday',
      ABS: 5,
      WPTAS: 10,
    },
    {
      name: 'Tuesday',
      ABS: 4,
      WPTAS: 6,
    },
    {
      name: 'Wednesday',
      ABS: 3,
      WPTAS: 5,
    },
    {
      name: 'Thursday',
      ABS: 7,
      WPTAS: 4,
    },
    {
      name: 'Friday',
      ABS: 3,
      WPTAS: 8,
    },
    {
      name: 'Saturday',
      ABS: 2,
      WPTAS: 2,
    },
    {
      name: 'Sunday',
      ABS: 3,
      WPTAS: 3,
    },
  ];


  const navigate = useNavigate();

  const handleButtonClickABS = (record) => {
    navigate('/dashboard/inventory/ABS', {state:{ patient: record }});
  };
  const handleButtonClickWPTAS = (record) => {
    navigate('/dashboard/inventory/WPTAS', {state:{ patient: record }});
  };

  const columns = [
    {
      title: "Patient Incare",
      dataIndex: "name",
      key: "id",
      align: "center",
      render: (_: any, record: any) => (
        <div className="double-line">
          <p>{record.patient_fname + " " + record.patient_lname}</p>
        </div>
      ),
    },
    {
      title: "Patient DOB",
      dataIndex: "patient_DOB",
      key: "patient_DOB",
      align: "center",
      render: (_: any, record: any) => (
        <div className="double-line">
          <p>{record.patient_DOB}</p>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_: any, record: any) => (
        <div className="double-line">
          <>
            <Space size="middle">
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
                        handleButtonClickABS(record);
                    }}
                >
                    ABS
                </Button>

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
                      handleButtonClickWPTAS(record);
                  }}
              >
                  WPTAS
              </Button>
              {/* <Link to = "/dashboard/inventory/ABS" state={{ patient: record }}>ABS</Link> */}
              
              {/* <Link to= "/dashboard/inventory/WPTAS" state={{ patient: record}}>WPTAS</Link> */}
            
            </Space>
          </>
        </div>
      ),
    }
  ];



  const [data, setData] = useState([
    {
      count: 0,
      name: `Patients Incare`,
      imagePath: `/assets/arts/nurse-art-1.svg`,
    },
    {
      count: 0,
      name: `Patients`,
      imagePath: `/assets/arts/nurse-art-2.svg`,
    },
    {
      count: 0,
      name: `Number of Response`,
      imagePath: `/assets/arts/nurse-art-3.svg`,
    },
    {
      count: 0,
      name: `Response Today`,
      imagePath: `/assets/arts/nurse-art-4.svg`,
    },
  ])

  useEffect(() => {
    
    const interval = setInterval(() => {
      getTestScores();
      if(data[0].count == 0){
        getPatientIncare();
      }
      if(data[2].count == 0){
        // getformResponse();
        getformResponse();
      }
      if(data[0].count != 0 && data[2].count != 0){
        clearInterval(interval);
      }
    }, 2000); // Simulate updates every 5 seconds
    // Cleanup the interval when the component unmounts

    return () => clearInterval(interval);
  },[])


  const ageData = [
    {
      name: '18-24',
      uv: 31.47,
      pv: 2400,
      fill: '#8884d8',
    },
    {
      name: '25-29',
      uv: 26.69,
      pv: 4567,
      fill: '#83a6ed',
    },
    {
      name: '30-34',
      uv: 15.69,
      pv: 1398,
      fill: '#8dd1e1',
    },
    {
      name: '35-39',
      uv: 8.22,
      pv: 9800,
      fill: '#82ca9d',
    },
    {
      name: '40-49',
      uv: 8.63,
      pv: 3908,
      fill: '#a4de6c',
    },
    {
      name: '50+',
      uv: 2.63,
      pv: 4800,
      fill: '#d0ed57',
    },
    {
      name: 'unknow',
      uv: 6.67,
      pv: 4800,
      fill: '#ffc658',
    },
  ];

  const styleRadialBarChart = {
    top: 0,
    left: 350,
    lineHeight: "14px"
  };



  
  return (
    <>
      <div className="wrapper --left">
        <div className="header">
          <h4>Dashboard Overview</h4>
          <hr />
        </div>

        <div className="dashboard__overview">
          <div className="analytics">
            {data.map((el, i) => (
              <div key={i} className="analytic">
                <img src={`${el.imagePath}`} alt="image" />
                <div>
                  <h1>{el.count}</h1>
                  <p>{el.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="indepth">
            <div className = "left-column">
              <Table columns={columns} dataSource={dataSource} className="table" />
            </div>

            <div className = "right-column">
              <ResponsiveContainer width="100%" height="50%">
                <BarChart
                  width={800}
                  height={300}
                  data={barChartDailyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={14} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ABS" stackId="a" fill="#8884d8"/>
                  <Bar dataKey="WPTAS" stackId="a"  fill="#82ca9d" />
                </BarChart>  
              </ResponsiveContainer>

                {/* <p>ABS Test Score Frequency Distribution (Real)</p>
                <ResponsiveContainer width="100%" height="50%">
                  <AreaChart
                    width={1200}
                    height={200}
                    data={barChartData}
                    syncId="anyId"
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="ABS" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer> */}

                {/* <p>WPTAS Test Score Frequency Distribution (Example)</p>
                <ResponsiveContainer width="100%" height='50%'>
                  <AreaChart
                    width={1200}
                    height={200}
                    data={barChartData}
                    syncId="anyId"
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="WPTAS" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>   
                </ResponsiveContainer> */}

                <p> ABS/WPTAS Test Score Frequency Distribution (Example)</p>
                <ResponsiveContainer width="100%" height='50%'>
                    <AreaChart
                    width={500}
                    height={400}
                    data={barChartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="ABS"
                      // stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="WPTAS"
                      // stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                  </ResponsiveContainer>
                {/* <ResponsiveContainer width="100%" height="50%">
                  <RadialBarChart cx="25%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={ageData}>
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'insideStart', fill: '#fff' }}
                      background
                      clockWise
                      dataKey="uv"
                    />
                    <Legend iconSize={10} layout="horizontal" verticalAlign="middle"  />
                  </RadialBarChart>
                </ResponsiveContainer> */}
              
            
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
