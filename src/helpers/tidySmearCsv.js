const timezone = '+02:00';

const parseSizeBin = param => {
  const x = param.split(".d");
  return +x[1] / 1e12;
};

export default function tidySmearCsv(data) {
  const header = data[0].slice(6, data[0].length);
  const body = data.slice(1, data.length);

  const datetime = body.map(item => new Date(
    `${item[0]}-${item[1]}-${item[2]}T${item[3]}:${item[4]}:${item[5]}.000${timezone}`
  ));

  const size = header.map(parseSizeBin).sort((a, b) => a - b);

  // 2d array: rows - size ascending, columns - datetime ascending
  const dndlogdp = [...Array(size.length)].map(() => Array(datetime.length));
  for (let i = 0; i < body.length; i++) {
    const rowData = body[i].slice(6, body.length);
    for (let j = 0; j < rowData.length; j++) {
      let index = size.indexOf(parseSizeBin(header[j]));
      dndlogdp[index][i] = +rowData[j];
    };
  };

  return {
    datetime: datetime,
    size: size,
    dndlogdp: dndlogdp,
  };
};
