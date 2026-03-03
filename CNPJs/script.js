function formatarCNPJ(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
    value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
    
    input.value = value;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || 'N/A';
}

async function buscarCNPJ() {
    const cnpjInput = document.getElementById('cnpjInput');
    const cnpj = cnpjInput.value.replace(/\D/g, '');

    if (cnpj.length !== 14) {
        showError('CNPJ INVÁLIDO! Digite 14 dígitos');
        return;
    }

    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    const btnBuscar = document.getElementById('btnBuscar');

    loading.classList.remove('hidden');
    result.classList.add('hidden');
    error.classList.add('hidden');
    btnBuscar.disabled = true;

    try {
        const apiUrl = `https://receitaws.com.br/v1/cnpj/${cnpj}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('CNPJ não encontrado');
        }

        const data = await response.json();
        
        if (data.status === 'ERROR') {
            throw new Error(data.message || 'Erro ao buscar CNPJ');
        }

        displayResult(data);

    } catch (err) {
        showError(err.message);
    } finally {
        loading.classList.add('hidden');
        btnBuscar.disabled = false;
    }
}

function displayResult(data) {
    setText('nome', data.nome);
    setText('cnpj', data.cnpj);
    setText('razaoSocial', data.razao_social);
    setText('nomeFantasia', data.fantasia);
    setText('dataAbertura', data.abertura);
    setText('situacao', data.situacao);
    setText('tipo', data.tipo);
    setText('porte', data.porte);
    setText('capitalSocial', data.capital_social ? `R$ ${parseFloat(data.capital_social).toLocaleString('pt-BR')}` : '');
    
    const endereco = [data.logradouro, data.numero, data.complemento, data.bairro].filter(Boolean).join(', ');
    setText('endereco', endereco);
    setText('cidade', data.municipio);
    setText('uf', data.uf);
    setText('cep', data.cep);
    
    setText('telefone', data.telefone);
    setText('email', data.email);
    
    const atividade = data.atividade_principal && data.atividade_principal[0];
    setText('atividadePrincipal', atividade ? atividade.text : '');

    document.getElementById('result').classList.remove('hidden');
}

function showError(message) {
    const el = document.getElementById('errorMessage');
    if (el) el.textContent = message;
    document.getElementById('error').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('cnpjInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarCNPJ();
            }
        });
    }
});

