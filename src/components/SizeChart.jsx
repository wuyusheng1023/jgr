import { useRef, useEffect } from 'react';

import * as d3 from 'd3';
import * as colormap from 'colormap';

import * as math from 'mathjs';
import lodashClonedeep from 'lodash/cloneDeep';


const SizeChart = ({ data }) => {

  useEffect(() => {
    const dpLowerLimit = 3e-9;

    // plot dimemsions
    const width = 640;
    const height = 360;

    const conMargin = {
      top: 20,
      bottom: 80,
      left: 60,
      right: 120
    };

    // const colorBarMargin = {
    //   top: 20,
    //   bottom: 50,
    //   left: 720,
    //   right: 50
    // };

    const conWidth = width - conMargin.left - conMargin.right;
    const conHeight = height - conMargin.top - conMargin.bottom;

    const x = data.datetime;
    const pxX = x.length;
    const scX = d3.scaleUtc().domain(d3.extent(x)).range([conMargin.left, conMargin.left + conWidth]);

    const y = data.size.filter(x => x > dpLowerLimit);
    const pxY = y.length;
    const scY = d3.scaleLog().domain(d3.extent(y)).range([conMargin.top + conHeight, conMargin.top]);

    const rawArr = data.dndlogdp.slice(data.size.length - pxY);

    // function: get the median of an arry
    const median = arr => {
      const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
      return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };

    //Smooth rawArr
    const smoothDNdlogDp = (rawArr, smX, smY) => {
      const paddingX = (smX - 1) / 2;
      const paddingY = (smY - 1) / 2;
      let smArr = [];
      for (let i = 0; i < pxY; i++) {
        for (let j = 0; j < pxX; j++) {
          if (j === 0) { smArr[i] = [] };
          let filterArr = [];
          for (let ii = -paddingX; ii <= paddingX; ii++) {
            for (let jj = -paddingY; jj <= paddingY; jj++) {
              if (i + ii >= 0 && i + ii < pxY && j + jj >= 0 && j + jj < pxX) {
                filterArr.push(rawArr[i + ii][j + jj])
              };
            };
          };
          smArr[i][j] = median(filterArr);
        };
      };
      return smArr;
    };
    const smArr1 = smoothDNdlogDp(rawArr, 3, 3);
    const smArr2 = smoothDNdlogDp(rawArr, 9, 5);
    
    // select raw data or a smooth data to plot the contour
    const plotData = lodashClonedeep(rawArr).reverse();
    let z = [].concat(...plotData).map( x => x >= 10 ? Math.log10(x) : 1.000000001);

    // function to get a range array
    const range = (start, end, step = 1) => {
      let output = [];
      if (typeof end === 'undefined') {
        end = start;
        start = 0;
      }
      for (let i = start; i < end; i += step) {
        output.push(i);
      }
      return output;
    };

    // calculate dNdlogDp contour color scale
    const logDpRange = range(1, 4.0001, 0.05)
    const colors = colormap({
      colormap: 'jet',
      nshades: logDpRange.length,
      format: 'hex',
      alpha: 1
    });
    var scC = d3.scaleLinear()
      .domain(logDpRange)
      .range(colors);

    // find ROI
    const upperDp = 25e-9;
    const upperIndex = y.map(v => v > upperDp).indexOf(true);
    const upperArr = smArr2[upperIndex];
    const topRegion = smArr2.slice(upperIndex);
    const bottomRegion = smArr2.slice(0, upperIndex);
    const topROI = topRegion.map(dpArr => dpArr.map(v => -1));
    const bottomROI = bottomRegion.map(dpArr => dpArr.map((v, i) => v - upperArr[i]));
    const ROI = bottomROI.concat(topROI);

    // find ROI2
    const quantile = (arr, q) => {
      const asc = arr => arr.sort((a, b) => a - b);
      const sorted = asc(arr);
      const pos = (sorted.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      } else {
        return sorted[base];
      }
    };
    const smROI = ROI.map( (arr, i) => arr.map( (v, j) => smArr1[i][j] * ( v>0 ? 1 : 0 ) ) );
    const q1 = quantile([].concat(...smROI).filter(v => v>0), .25);
    const bottomROI2 = bottomRegion.map(dpArr => dpArr.map( v => v-q1 ));
    const ROI2 = bottomROI2.concat(topROI);

    // get intervals of each size bin in ROI
    const divideToIntervals = arr => {
      const intervals = [];
      let startIndex = null;
      let endIndex = null;
      for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
          if (arr[i] > 0) {
            startIndex = i;
            if (arr[i + 1] <= 0) {
              endIndex = i + 1;
            };
          };
        } else if (i !== arr.length - 1) {
          if ((arr[i - 1] <= 0) && (arr[i] > 0)) {
            startIndex = i;
          }
          if ((arr[i] > 0) && (arr[i + 1] <= 0)) {
            endIndex = i + 1;
          };
        } else {
          if (arr[i] > 0) {
            // console.log(i)
            if (arr[i - 1] <= 0) {
              startIndex = i;
            };
            endIndex = i + 1;
          };
        };
        if (endIndex) {
          intervals.push([startIndex, endIndex]);
          endIndex = null;
        };
      };
      return intervals;
    };

    // get intervals of all size bin rows
    const intervalsArr = [];
    for (let i=0; i < ROI2.length; i++) {
      intervalsArr.push(divideToIntervals(ROI2[i]));
    };

    console.log(intervalsArr)

    // Gaussian Function
    const gaussFunc = (x, xMaxi, yMaxi, s) => {
      return yMaxi * math.exp(-((x - xMaxi) * (x - xMaxi) / s));
    };

    // Gaussian Fitting
    const gaussFit = (xOriginal, yOriginal) => {
      const average = math.mean(yOriginal);

      const x = [];
      const y = [];

      // only use half large valuse to fit
      for (let i = 0; i < yOriginal.length; i++) {
        if (yOriginal[i] > average) {
          x.push(xOriginal[i]);
          y.push(yOriginal[i]);
        };
      };

      const zMatrix = math.matrix(math.log(y));
      const zMatrixT = math.transpose(zMatrix);
      const xMatrix = math.ones([y.length, 3]);

      for (let i = 0; i < y.length; i++) {
        xMatrix[i][1] = x[i];
        xMatrix[i][2] = x[i] * x[i];
      };
  
      // least squares
      const xMatrixT = math.transpose(xMatrix);
      const bMatrix = math.multiply(math.multiply(math.inv(math.multiply(xMatrixT,
        xMatrix)), xMatrixT), zMatrixT);

      const b2 = math.subset(bMatrix, math.index(2));
      const b1 = math.subset(bMatrix, math.index(1));
      const b0 = math.subset(bMatrix, math.index(0));

      const s = -1 / b2;
      const xMaxi = s * b1 / 2;
      const yMaxi = math.exp(b0 + xMaxi * xMaxi / s);

      const yFit = [];
      for (let i = 0; i < yOriginal.length; i++) {
        yFit.push(gaussFunc(xOriginal[i], xMaxi, yMaxi, s));
      };

      return yFit;
    };

    // maxiumum-concentration method
    
    // start plotting
    const svg = d3.select(ref.current).attr("viewBox", `0 0 ${width} ${height}`);
    const g = svg.append("g")
      .attr("transform", `translate( ${conMargin.left}, ${conMargin.top} ) scale(${conWidth / pxX}, ${conHeight / pxY})`);
    const pathMkr = d3.geoPath();

    // plot dNdlogDp contour
    let conMkr = d3.contours().size([pxX, pxY]).thresholds(100);
    g.append("g")
      .selectAll("path").data( conMkr(z) ).enter()
      .append("path")
        .attr("d", pathMkr)
        .attr("fill", d => scC(d.value))
        .attr("stroke", "none");

    // plot x-axis
    svg.append("g")
      .attr("transform", `translate( 0, ${conMargin.top + conHeight} )`)
      .call(d3.axisBottom(scX).tickFormat(d3.utcFormat("%H:%M"))
        .ticks(d3.utcHour.every(3)));
    
    // plot y-axis
    svg.append("g") 
      .attr("transform", `translate( ${conMargin.left}, 0 )`)
      .call(d3.axisLeft(scY));

    // plot ROI contour line
    z = Array.from(ROI2).reverse();
    z = [].concat(...z);
    conMkr = d3.contours().size([pxX, pxY]).thresholds(10);
    g.append("g").append("path")
      .attr("d", pathMkr(conMkr.contour(z, 0.025)))
      .attr("fill", "none").attr("stroke", "grey")
      .attr("stroke-width", 1);
  });

  const ref = useRef();

  return (
    <svg
      style={{backgroundColor: "LightGrey"}}
      ref={ref}
    />
  );
};

export default SizeChart;
