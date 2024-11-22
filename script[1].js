document.addEventListener('DOMContentLoaded', () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let colaboradores = JSON.parse(localStorage.getItem('colaboradores')) || [];

    const toggleScreen = (screen) => {
        document.querySelectorAll('.card').forEach(card => card.classList.add('hidden'));
        document.getElementById(screen).classList.remove('hidden');
    };

    document.getElementById('go-to-register').addEventListener('click', () => toggleScreen('register-screen'));
    document.getElementById('back-to-login').addEventListener('click', () => toggleScreen('login-screen'));

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        if (users.some(user => user.email === email)) {
            alert('E-mail já cadastrado.');
            return;
        }
        users.push({
            name: document.getElementById('register-name').value,
            email,
            password: document.getElementById('register-password').value
        });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Cadastro realizado com sucesso.');
        toggleScreen('login-screen');
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        if (users.some(user => user.email === email && user.password === password)) {
            toggleScreen('training-screen');
            renderColaboradores(colaboradores); // Render initial list
        } else {
            alert('E-mail ou senha incorretos.');
        }
    });

    const renderColaboradores = (colaboradoresToDisplay) => {
        const conteudo = colaboradoresToDisplay.map((c, i) => {
            const dataVencimento = new Date(c.data);
            const hoje = new Date();
            let status = 'status-ok'; // Default status

            if (dataVencimento < hoje) {
                status = 'status-error';
            } else if (dataVencimento - hoje <= 30 * 24 * 60 * 60 * 1000) { // 30 days
                status = 'status-warning';
            }

            return `
                <tr>
                    <td><span class="${status}"></span> ${c.nome}</td>
                    <td>${c.matricula}</td>
                    <td>${c.funcao}</td>
                    <td>${c.treinamento}</td>
                    <td>${c.status}</td>
                    <td>${c.data}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editColaborador(${i})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteColaborador(${i})">Excluir</button>
                    </td>
                </tr>
            `;
        }).join('');
        document.getElementById('conteudo').innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Matrícula</th>
                        <th>Função</th>
                        <th>Treinamento</th>
                        <th>Status</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>${conteudo}</tbody>
            </table>`;
    };

    document.getElementById('form-add-colaborador').addEventListener('submit', (e) => {
        e.preventDefault();
        colaboradores.push({
            nome: document.getElementById('nome').value,
            matricula: document.getElementById('matricula').value,
            funcao: document.getElementById('funcao').value,
            treinamento: document.getElementById('treinamento').value,
            status: document.getElementById('status_treinamento').value,
            data: document.getElementById('data').value
        });
        localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
        renderColaboradores(colaboradores); // Update after adding
        $('#addColaboradorModal').modal('hide');
    });

    window.deleteColaborador = (index) => {
        if (confirm('Deseja excluir?')) {
            colaboradores.splice(index, 1);
            localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
            renderColaboradores(colaboradores); // Update after deleting
        }
    };

    document.getElementById('export-button').addEventListener('click', exportToExcel);

    function exportToExcel() {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(colaboradores);
        XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
        XLSX.writeFile(wb, 'colaboradores.xlsx');
    }

    // Filtering logic
    document.getElementById('btnBusca').addEventListener('click', () => {
        const pesquisa = document.getElementById('txtBusca').value.toLowerCase();
        const colaboradoresFiltrados = colaboradores.filter(col => {
            return col.nome.toLowerCase().includes(pesquisa) ||
                   col.matricula.toString().includes(pesquisa);
        });
        renderColaboradores(colaboradoresFiltrados); // Update with filtered results
    });

    // Edit functionality
    window.editColaborador = (index) => {
        // Get the current collaborator data
        const colaborador = colaboradores[index];

        // Populate the modal form with the collaborator's data
        document.getElementById('editNome').value = colaborador.nome;
        document.getElementById('editMatricula').value = colaborador.matricula;
        document.getElementById('editFuncao').value = colaborador.funcao;
        document.getElementById('editTreinamento').value = colaborador.treinamento;
        document.getElementById('editStatusTreinamento').value = colaborador.status;
        document.getElementById('editData').value = colaborador.data;

        // Set the hidden index field for the form
        document.getElementById('editIndex').value = index;

        // Show the edit modal
        $('#editColaboradorModal').modal('show');
    };

    // Handle the edit form submission
    document.getElementById('form-edit-colaborador').addEventListener('submit', (e) => {
        e.preventDefault();
        const index = document.getElementById('editIndex').value;

        // Update collaborator data with new values
        colaboradores[index] = {
            nome: document.getElementById('editNome').value,
            matricula: document.getElementById('editMatricula').value,
            funcao: document.getElementById('editFuncao').value,
            treinamento: document.getElementById('editTreinamento').value,
            status: document.getElementById('editStatusTreinamento').value,
            data: document.getElementById('editData').value
        };

        // Update localStorage
        localStorage.setItem('colaboradores', JSON.stringify(colaboradores));

        // Re-render the table
        renderColaboradores(colaboradores);

        // Close the modal
        $('#editColaboradorModal').modal('hide');
    });
});