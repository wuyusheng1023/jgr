import { useState, useEffect } from 'react';

import 'antd/dist/antd.css';
import Input from 'antd/lib/input';

import Papa from 'papaparse';

import './App.css';


function App() {

  const [data, setDate] = useState();

  useEffect(() => {
    console.log(data);
  }, [data])

  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const rawData = e.target.result;
      setDate(Papa.parse(rawData));
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Input
      type="file"
      accept=".csv,.txt,.xls,.xlsx"
      onChange={handleFileUpload}
    />
  );
};

export default App;
