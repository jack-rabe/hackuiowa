/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
    'index.js': {
      file: {
        contents: `
  import express from 'express';
  const app = express();
  const port = 3111;

  var input2 = [2,5,3,1,8,9,7,6];
  var input1 = [2,1,4];

function solution(x){
    var sum = 0;
    var expectedSum = 0;
    for (let i = 0; i < x.length; i++){
        sum += x[i];
        expectedSum += i+1;
    }
    expectedSum += x.length + 1
    return expectedSum - sum;
}
var output = solution(input1);
  
  app.get('/', (req, res) => {
    res.send([output]);
  });
  
  app.listen(port, () => {
    console.log(\`App is live at http://localhost:\${port}\`);
  });`,
      },
    },
    'package.json': {
      file: {
        contents: `
  {
    "name": "example-app",
    "type": "module",
    "dependencies": {
      "express": "latest",
      "nodemon": "latest"
    },
    "scripts": {
      "start": "nodemon --watch './' index.js"
    }
  }`,
      },
    },
  };
  