import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import ModalEdicaoLocatario from '../../components/ModalEdicaoLocatario';
import ModalCadastroLocatario from '../../components/ModalCadastroLocatario';
import TabelaLocatarios from '../../components/TabelaLocatarios';

const Locatarios = (props) => {
    const { theme } = props;
    const [locatarios, setLocatarios] = useState([]);
    const [updateTable, setUpdateTable] = useState(false);
    const [editLocatario, setEditLocatario] = useState(null);
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [isModalCadOpen, setIsModalCadOpen] = useState(false);

    const handleDelete = (locatario) => {
        axios.post('https://alugafacil.tech/api/deleta_locatario.php', { id: locatario.id })
            .then(response => {
                setUpdateTable(!updateTable);
                message.open({
                    type: 'success',
                    content: response.data.message,
                });
            })
            .catch(error => {
                console.log('Failed:', error);
            });
    };

    const showModalCad = () => {
        setIsModalCadOpen(true);
    };

    useEffect(() => {
        axios.get("https://alugafacil.tech/api/busca_locatarios.php")
            .then(response => {
                setLocatarios(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, [updateTable]);

    const handleEdit = (locatario) => {
        setEditLocatario(locatario);
        setIsModalEditOpen(true);
    };

    return (
        <>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'end', marginBottom: '10px' }}>
                <Button onClick={showModalCad}><PlusOutlined /> Adicionar Locatário</Button>
            </div>
            <TabelaLocatarios
                locatarios={locatarios}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                setUpdateTable={setUpdateTable}
                theme={theme}
            />
            <ModalCadastroLocatario
                theme={theme}
                updateTable={updateTable}
                setUpdateTable={setUpdateTable}
                isModalCadOpen={isModalCadOpen}
                setIsModalCadOpen={setIsModalCadOpen}
            />
            <ModalEdicaoLocatario
                theme={theme}
                isModalEditOpen={isModalEditOpen}
                setIsModalEditOpen={setIsModalEditOpen}
                editLocatario={editLocatario}
                setEditLocatario={setEditLocatario}
                setUpdateTable={setUpdateTable}
                updateTable={updateTable}
            />
        </>
    )
}

export default Locatarios;
