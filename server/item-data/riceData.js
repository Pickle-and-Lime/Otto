//totally making this up....
//average #days before expires
var aveExp = 365; 

var trainingSet = {
  //1-2 people
  small : [
    {input: [10/365], output:[0.1]},
    {input: [20/365], output:[0.1]},
    {input: [30/365], output:[0.1]},
    {input: [45/365], output:[0.9]},
    {input: [60/365], output:[0.9]},
  ],

  //3-5 people
  medium : [
    {input: [10/365], output:[0.1]},
    {input: [20/365], output:[0.1]},
    {input: [30/365], output:[0.9]},
    {input: [45/365], output:[0.9]},
    {input: [60/365], output:[0.9]},
  ], 

  //6-9 people
  large : [
    {input: [5/365], output:[0.1]},
    {input: [10/365], output:[0.1]},
    {input: [15/365], output:[0.9]},
    {input: [20/365], output:[0.9]},
    {input: [25/365], output:[0.9]},
  ], 
  // >9 people
  xlarge : [
    {input: [5/365], output:[0.1]},
    {input: [10/365], output:[0.9]},
  ], 
};
module.exports = {
  aveExp : aveExp,
  trainingSet : trainingSet
};