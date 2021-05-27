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

  const onChange = value => {
    setData(null);
    setInputType(value);
  };

  const passData = data => {
    setData(data);
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
            <Option value='smear_csv'>Upload CSV</Option>
            <Option value='smear_online'>Select SMEAR Online Data</Option>
          </Select>
        </Col>

        <Col span={14}>
          { inputType === 'smear_csv' ? <SmearCsvReader passData={passData} /> : null }
          { inputType === 'smear_online' ? <SmearOnlineReader passData={d => console.log(d)}/> : null }
        </Col>
      </Row>

      <Row>
        <Col span={20} offset={2}>
          { data ? <SizeChart data={data}/> : null }        
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
