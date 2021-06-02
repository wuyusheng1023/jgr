import { useState, useEffect } from 'react';

import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import DatePicker from 'antd/lib/date-picker';

import constructQueryUrl from '../helpers/constructQueryUrl.js';
import tidySmearOnline from '../helpers/tidySmearOnline';


export default function SmearCsvReader({ passData }) {
  
  const [componentSize, setComponentSize] = useState('default');
  const [formLayout] = useState('horizontal')
  const [data, setDate] = useState();

  useEffect(() => {
    if (data) {
      passData(data);
    };
  }, [data]);

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const buttonItemLayout =
    formLayout === 'horizontal' ?
      {
        wrapperCol: {
          span: 14,
          offset: 4,
        },
      } :
      null;

  const processData = rawData => {
    const data = tidySmearOnline(rawData);
    setDate(data);
  };

  const onFinish = data => {
    passData(null);
    if (data.date === undefined) {
      alert("Please selete a date!")
      return
    };
    passData("fetching");

    const url = constructQueryUrl(data);
    fetch(url)
      .then(res => res.json())
      .then(processData)
      .catch(console.error);
  };

  return (
    <>
      <Form
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 14,
        }}
        layout="horizontal"
        initialValues={{
          size: componentSize,
        }}

        initialValues={{
          station: "HYY",
          quality: "ANY",
          interval: "1 min",
          aggregation: "NONE"
        }}

        onValuesChange={onFormLayoutChange}
        size={componentSize}

        onFinish={onFinish}
      >
        <Form.Item label="Station" name="station">
          <Select style={{ width: 220 }}>
            <Select.Option value="VAR">SMEAR I Värriö forest</Select.Option>
            <Select.Option value="HYY">SMEAR II Hyytiälä forest</Select.Option>
            <Select.Option value="KUM">SMEAR III Helsinki Kumpula</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Date" name="date">
          <DatePicker />
        </Form.Item>

        <Form.Item label="Process Level" name="quality" style={{ display: 'none' }}>
          <Select style={{ width: 120 }}>
            <Select.Option value="ANY">ANY</Select.Option>
            <Select.Option value="CHECKED">CHECKED</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Averaging" name="interval" style={{ display: 'none' }}>
          <Select style={{ width: 120 }}>
            <Select.Option value="1 min">1 min</Select.Option>
            <Select.Option value="30 min">30 min</Select.Option>
            <Select.Option value="1 hour">1 hour</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Average Type" name="aggregation" style={{ display: 'none' }}>
          <Select style={{ width: 120 }}>
            <Select.Option value="NONE">NONE</Select.Option>
            <Select.Option value="ARITHMETIC">ARITHMETIC</Select.Option>
            <Select.Option value="GEOMETRIC">GEOMETRIC</Select.Option>
            <Select.Option value="SUN">SUN</Select.Option>
            <Select.Option value="MEDIAN">MEDIAN</Select.Option>
            <Select.Option value="MIN">MIN</Select.Option>
            <Select.Option value="MAX">MAX</Select.Option>
            <Select.Option value="CIRCULAR">CIRCULAR</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item {...buttonItemLayout}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    </>
  );
};
