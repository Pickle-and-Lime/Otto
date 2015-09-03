//totally making this up....
//average #days before expires
var aveExp = 14; 

var trainingSet = [
    {input: [1/365], output:[0.1]},
    {input: [4/365], output: [0.1]},
    {input: [7/365], output: [0.9]},
    {input: [10/365], output: [0.9]}
  ];
module.exports = {
  aveExp : aveExp,
  trainingSet : trainingSet
};