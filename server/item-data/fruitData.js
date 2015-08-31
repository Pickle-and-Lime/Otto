//totally making this up....
//average #days before expires
var aveExp = 7; 

var trainingSet = [
    {input: [1/365], output:[0.1]},
    {input: [7/365], output:[0.9]},
  ];
module.exports = {
  aveExp : aveExp,
  trainingSet : trainingSet
};