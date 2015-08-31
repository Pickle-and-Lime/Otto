//totally making this up....
//average #days before expires
var aveExp = 365; 

var trainingSet = [
    {input: [10/365], output:[0.1]},
    {input: [30/365], output:[0.9]},
  ];
  
module.exports = {
  aveExp : aveExp,
  trainingSet : trainingSet
};