import { useState } from 'react';

import 'antd/dist/antd.css';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Select from 'antd/lib/select';
import Divider from 'antd/lib/divider';

import SmearCsvReader from './components/SmearCsvReader.jsx';
import SmearOnlineReader from './components/SmearOnlineReader.jsx';
import SizeChart from './components/SizeChart.jsx';


const { Option } = Select;


function App() {

  const [data, setData] = useState();
  const [inputType, setInputType] = useState();
  const [status, setStatus] = useState();

  const onChange = value => {
    setData(null);
    setInputType(value);
  };

  const passData = data => {
    if (typeof data === 'string') {
      setStatus(data);
    } else {
      console.log(data);
      setStatus("plot");
      setData(data);
    };
  };

  const passResult = result => {
    console.log("result", result);
  };

  return (
    <>
      <Row style={{ paddingTop: 20}}>
        <Col span={20} offset={2}>
          <h1>New Particle Formation Event Analyzer</h1>
        </Col>
      </Row>
      
      <Row style={{ paddingBottom: 10}}>
        <Col span={6} offset={2}>
          <Select
            style={{ width: 250 }}
            placeholder="Select a data type"
            onChange={onChange}
          >
            <Option value='smear_online'>Select SMEAR Online Data</Option>
            <Option value='smear_csv'>Upload CSV</Option>
          </Select>
        </Col>

        <Col span={14}>
          { inputType === 'smear_online' ? <SmearOnlineReader passData={passData}/> : null }
          { inputType === 'smear_csv' ? <SmearCsvReader passData={passData} /> : null }
        </Col>
      </Row>

      <Row>
        <Col span={20} offset={2}>
          { 
            status === "fetching" ? 
              <h2>Fetching Data, please wait...</h2> : 
              null
          }
          {
            data ? 
              <SizeChart data={data} passResult={passResult}/> : 
              null 
          }
        </Col>
      </Row>

      <Row>
        <Col span={18} offset={3}>
          <Divider orientation="left"></Divider>
          <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '30px' }}>
            © Copyright 2021. All Rights Reserved.
            <br></br> Institute for Atmospheric and Earth System Research (INAR), University of Helsinki
            <br></br> Contact: Yusheng Wu, yusheng.wu@helisnki.fi, wuyusheng1023@gmail.com
          </p>
        </Col>
      </Row>
    </>
  );
};

export default App;
