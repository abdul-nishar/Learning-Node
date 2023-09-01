const superagent = require("superagent");
const fs = require("fs");

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject("Sorry, could not find the file❗️");
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject("Sorry, could not find the file❗️");
      resolve("Successfully wrote the file");
    });
  });
};

const getDogPic = async () => {
  try {
    const data = await readFilePromise(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    const res1 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const res2 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const res3 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const res = await Promise.all([res1, res2, res3]);

    const imgs = res.map((response) => response.body.message);
    console.log(imgs);

    await writeFilePromise(`dog-image.txt`, imgs.join("\n"));
    console.log("Random dog image has been loaded to file!");
  } catch (err) {
    console.log(err);
  }
};

getDogPic();

// readFilePromise(`${__dirname}/dog.txt`)
//   .then((data) => {
//     console.log(`Breed: ${data}`);
//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then((res) => {
//     console.log(res.body.message);

//     return writeFilePromise(`dog-image.txt`, res.body.message);
//   })
//   .then(() => console.log("Random dog image has been loaded to file!"))
//   .catch((err) => console.log(err.message));
