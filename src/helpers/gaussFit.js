import * as math from 'mathjs';


// Gaussian Function
const gaussFunc = (x, xMaxi, yMaxi, s) => {
  return yMaxi * math.exp(-((x - xMaxi) * (x - xMaxi) / s));
};

// Gaussian Fitting
export default function gaussFit(xOriginal, yOriginal) {
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
