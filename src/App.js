import { useState, useEffect } from 'react';

import 'antd/dist/antd.css';
import Input from 'antd/lib/input';

import Papa from 'papaparse';

import './App.css';


function App() {

  const timezone = '+02:00';

  const [data, setDate] = useState();

  useEffect(() => {
    console.log(data);
  }, [data]);

  const parseSizeBin = param => {
    const [_, x] = param.split(".d");
    return +x / 1e12
  };

  const tidyParsedData = data => {
    const header = data[0].slice(6, data[0].length);
    const body = data.slice(1, data.length);

    const datetime = body.map(item => new Date(
      `${item[0]}-${item[1]}-${item[2]}T${item[3]}:${item[4]}:${item[5]}.000${timezone}`
    ));

    const size = header.map(parseSizeBin).sort((a, b) => a - b);
    
    const dndlogdp = [];
    for (let i=0; i < body.length; i++) {
      const rowData = body[i].slice(6, body.length);
      dndlogdp[i] = [];
      for (let j=0; j < rowData.length; j++) {
        let index = size.indexOf(parseSizeBin(header[j]));
        dndlogdp[i][index] = +rowData[j];
      };
    };

    return {
      datetime: datetime,
      size: size,
      dndlogdp: dndlogdp,
    };
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const rawData = e.target.result;
      const parsedDate = Papa.parse(rawData).data;
      const tidyDate = tidyParsedData(parsedDate);
      setDate(tidyDate);
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
