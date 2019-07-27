const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sha1 = require('sha1');
const Form = require('form-data');

async function score() {
  try {
    const token = 'd55d68f8cce28a574a29f9c58a25eeee3d849b1f';
    const { data } = await axios.get(`https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${token}`);
    const file = path.resolve(__dirname, 'answer.json');
    fs.writeFileSync(file, JSON.stringify(data));
    const { numero_casas } = data;
    let cifrado = data.cifrado.toLowerCase().split('');
    let decifrado = cifrado.map(letra => {
      const code =  letra.charCodeAt(0);
      return letra.match('[a-z]') ? String.fromCharCode((code >= (97 + numero_casas) ? code - numero_casas : code + 22)) : letra;
    });
    data.decifrado = decifrado.join('');
    data.resumo_criptografico = sha1(data.decifrado);
    fs.writeFileSync(file, JSON.stringify(data));
    let form = new Form();      
    form.append('answer', fs.createReadStream(file, 'utf8'));
    const url = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${token}`;
    const config = { headers: form.getHeaders() }
    const score = await axios.post(url, form, config);
    console.log(score.data);
    // form.pipe(concat(async answer => {
    //   try {
    //     const url = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${token}`;
    //     const config = { headers: form.getHeaders() }
    //     const { data } = await axios.post(url, answer, config);
    //     console.log(data);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }));
  } catch (error) {
    console.error(error);
  }
};

score();
