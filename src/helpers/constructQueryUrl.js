import settings from '../settings.js';


const { rootEndpoint, dpList } = settings;


export default function constructQueryUrl(data) {
  const dateString = data.date._d.toISOString();
  const indx = dateString.indexOf("T");
  const date = dateString.slice(0, indx);
  data.from = date + "T00:00:00.000";
  data.to = date + "T23:59:59.999";
  data.interval = data.interval.split(" ")[0];
  const variables = dpList.map(item => "tablevariable=" + data.station + "_DMPS." + item);

  delete data.station;
  delete data.date;
  const params = Object.entries(data).map(([key, value]) => `${key}=${value}`)
  const url = rootEndpoint + "?" + params.join("&") + "&" + variables.join("&")
  return url;
};
