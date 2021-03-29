import 'antd/dist/antd.css';
import Input from 'antd/lib/input';

import './App.css';


function App() {

  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      console.log(e.target.result);
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
