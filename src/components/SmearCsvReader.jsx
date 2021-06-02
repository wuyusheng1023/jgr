import { useState, useEffect } from 'react';

import Input from 'antd/lib/input';

import Papa from 'papaparse';

import tidySmearCsv from '../helpers/tidySmearCsv.js';


export default function SmearCsvReader({ passData=f=>f }) {

  const [data, setDate] = useState();

  useEffect(() => {
    if (data) {
      passData(data);
    };
  }, [passData, data]);

  const handleFileUpload = e => {
    passData(null);
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const rawData = e.target.result;
      const parsedDate = Papa.parse(rawData).data;
      const tidyDate = tidySmearCsv(parsedDate);
      setDate(tidyDate);
    };
    reader.readAsBinaryString(file);
  };

  return <Input
    type="file"
    accept=".csv,.txt,.xls,.xlsx"
    onChange={handleFileUpload}
  />;
};
