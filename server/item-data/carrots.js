//totally making this up....
//average #days before expires
var aveExp = 14; 

var trainingSet = {
  //1-2 people
  small : [
    {input: [1/365], output:[0.1]},
    // {input: [5/365], output:[0.1]},
    // {input: [7/365], output:[0.1]},
    // {input: [10/365], output:[0.1]},
    // {input: [12/365], output:[0.1]},
    {input: [15/365], output:[0.1]},
    {input: [20/365], output:[0.1]},
    {input: [25/365], output:[0.9]},
  ],

  //3-5 people
  medium : [
    {input: [1/365], output:[0.1]},
    {input: [5/365], output:[0.1]},
    {input: [9/365], output:[0.9]},
    {input: [12/365], output:[0.9]},
    {input: [15/365], output:[0.9]},
  ], 

  //6-9 people
  large : [
    {input: [1/365], output:[0.1]},
    {input: [3/365], output:[0.1]},
    {input: [5/365], output:[0.9]},
    {input: [10/365], output:[0.9]},
    {input: [15/365], output:[0.9]},
  ], 
  // >9 people
  xlarge : [
    {input: [1/365], output:[0.1]},
    {input: [3/365], output:[0.9]},
  ], 
};
module.exports = {
  aveExp : aveExp,
  trainingSet : trainingSet
};