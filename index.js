
const fs = require('fs');
const tesseract = require('tesseract.js');

/**
 * Valida um número de cartão de crédito usando o algoritmo de Luhn
 * e determina a "bandeira" com base em uma imagem.
 *
 * @param {string} cardNumber - Número do cartão de crédito.
 * @param {string} imagePath - Caminho para a imagem contendo informações da "bandeira".
 * @returns {Promise<object>} - Um objeto com o status de validação e a "bandeira".
 */
async function validateCreditCard(cardNumber, imagePath) {
  // Função para validar o número do cartão usando o algoritmo de Luhn
  function luhnAlgorithm(number) {
    let total = 0;
    const reverseDigits = number.split('').reverse();

    reverseDigits.forEach((digit, index) => {
      let n = parseInt(digit, 10);
      if (index % 2 === 1) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      total += n;
    });

    return total % 10 === 0;
  }

  // Função para extrair a "bandeira" da imagem usando OCR
  async function extractBandeira(imagePath) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Imagem não encontrada no caminho: ${imagePath}`);
      }

      const result = await tesseract.recognize(imagePath, 'eng');
      return result.data.text.trim();
    } catch (error) {
      return `Erro ao extrair a bandeira: ${error.message}`;
    }
  }

  // Valida o número do cartão
  const isValid = luhnAlgorithm(cardNumber);
  if (!isValid) {
    return { valid: false, bandeira: null };
  }

  // Extrai a bandeira da imagem
  const bandeira = await extractBandeira(imagePath);

  return { valid: true, bandeira };
}

// Exemplo de uso
(async () => {
  const cardNumber = '4532015112830366'; // Número de cartão de exemplo
  const imagePath = 'base.png'; // Caminho para a imagem

  try {
    const result = await validateCreditCard(cardNumber, imagePath);
    console.log(result);
  } catch (error) {
    console.error('Erro:', error.message);
  }
})();