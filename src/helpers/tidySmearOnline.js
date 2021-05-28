const timezone = '+02:00';

const processDatetime = data => {
  const dttm = data.samptime;
  return new Date(`${dttm}${timezone}`);
};

const parseSizeBin = size => {
  const x = size.split(".d");
  return +x[1] / 1e12;
};

const processDndlogdp = (data, index) => {
  const array = [];
  for (let i = 0; i < data.data.length; i++) {
    const row = data.columns.map(value => data.data[i][value]);
    const sortedRow = index
      .map(value => row[value])
      .map(value => value || NaN);
    array.push(sortedRow);
  };
  return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
};

export default function tidySmearOnline(data) {
  const datetime = data.data.map(processDatetime);
  const size = data.columns.map(parseSizeBin);
  const sortedSize = [...size].sort((a, b) => Number(a) - Number(b));
  const index = sortedSize.map(value => size.indexOf(value));
  const dndlogdp = processDndlogdp(data, index);
  
  return {
    datetime: datetime,
    size: sortedSize,
    dndlogdp: dndlogdp,
  };
};
