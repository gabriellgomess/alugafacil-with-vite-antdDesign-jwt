import { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message } from 'antd';
import axios from 'axios';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';


const Imoveis = (props) => {
    const { TextArea } = Input;
    const { theme } = props;
    const [imoveis, setImoveis] = useState([]);
    const [statusFilters, setStatusFilters] = useState([]);
    const [isModalCadOpen, setIsModalCadOpen] = useState(false);
    const [updateTable, setUpdateTable] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [editImovel, setEditImovel] = useState({});
    const [localEditImovel, setLocalEditImovel] = useState(null);


    const showModalCad = () => {
        setIsModalCadOpen(true);
    };

    const handleOpenModal = (dadosImovel) => {
        setEditImovel({});
        setEditImovel(dadosImovel);
        showModalEdit();
    };

    const showModalEdit = () => {
        setIsModalEditOpen(true);
        if (formRefEdit.current && editImovel) {
            formRefEdit.current.setFieldsValue(editImovel);
        }
    };

    const handleOkModalCad = () => {
        if (formRef.current) {
            formRef.current.submit();
        } else {
            console.log('Formulário não encontrado');
        }
    };
    const handleOkModalEdit = () => {
        setIsModalEditOpen(false);
    };
    const handleCancelModalCad = () => {
        setIsModalCadOpen(false);
        resetFields();

    };
    const handleCancelModalEdit = () => {
        setIsModalEditOpen(false);
        resetFields();
    };
    const resetFields = () => {
        formRef.current.resetFields();
    }

    const formRef = useRef();
    const formRefEdit = useRef()

    useEffect(() => {
        axios.get("https://alugafacil.tech/api/busca_imoveis.php")
            .then(response => {
                setImoveis(response.data);
                const uniqueStatusValues = [...new Set(response.data.map(item => item.status))];
                const dynamicFilters = uniqueStatusValues.map(value => ({
                    text: value,
                    value: value.toLowerCase(),
                }));
                setStatusFilters(dynamicFilters);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });

    }, [updateTable]);
    const columns = [
        {
            title: 'Endereço',
            dataIndex: 'endereco',
            filterSearch: true, // Enable filter search
            width: '40%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: statusFilters, // Use dynamic filters
            filterSearch: true,
            onFilter: (value, record) => record.status === value,
            width: '20%',
            render: (text, record) => {
                if (record.status === 'manutencao') {
                    return <Tag icon={<CloseCircleOutlined />} color={theme.token.colorError}>{record.status}</Tag>
                } else if (record.status === 'vago') {
                    return <Tag icon={<ClockCircleOutlined />} color={theme.token.colorWarning}>{record.status}</Tag>
                } else if (record.status === 'locado') {
                    return <Tag icon={<CheckCircleOutlined />} color={theme.token.colorPrimary}>{record.status}</Tag>
                }

            }
        },
        {
            title: 'Valor do Aluguel',
            dataIndex: 'valor_aluguel',
            sorter: (a, b) => parseFloat(a.valor_aluguel) - parseFloat(b.valor_aluguel),
            width: '20%',
        },
        {
            title: 'Ações',
            dataIndex: 'acoes',
            width: '10%',
            render: (text, record) => {
                return (
                    <>
                        <Button type='text' onClick={() => handleEdit(record)} icon={<EditOutlined />} style={{ color: theme.token.colorPrimary }} />
                        <Button type='text' icon={<DeleteOutlined />} style={{ color: theme.token.colorError }} />
                    </>
                );
            }
        }

    ];
    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };
    const onFinish = (values) => {
        console.log('Success:', values);
        axios.post('https://alugafacil.tech/api/gera_imovel.php', values)
            .then(response => {
                console.log(response)
                setUpdateTable(!updateTable);
                messageApi.open({
                    type: 'success',
                    content: response.data.message,
                });
            })
    };

    const onFinishEdit = (values) => {
        console.log('Success:', values);
    }

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const handleCepChange = (e) => {
        const cep = e.target.value;
        buscaCEP(cep);
    }
    const buscaCEP = (cep) => {
        axios.get(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => {
                console.log(response.data)
                formRef.current.setFieldsValue({
                    endereco: response.data.logradouro,
                    bairro: response.data.bairro,
                    cidade: response.data.localidade,
                    estado: response.data.uf
                });
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }

    useEffect(() => {
        if (isModalEditOpen && formRefEdit.current) {
            formRefEdit.current.setFieldsValue(editImovel);
        }
    }, [isModalEditOpen]);

    const handleLocalFieldChange = (e, fieldName) => {
        setLocalEditImovel({ ...localEditImovel, [fieldName]: e.target.value });
    };

    const handleEdit = (locatario) => {
        setEditImovel(locatario); // atualiza o locatário a ser editado
        setIsModalEditOpen(true);  // abre o modal
    };


    return (
        <>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'end', marginBottom: '10px' }}>
                <Button onClick={showModalCad}><PlusOutlined /> Adicionar Imóvel</Button>
            </div>
            <Table columns={columns} dataSource={imoveis} onChange={onChange} />
            <Modal
                width={1000}
                title="Cadastrar Imóvel"
                open={isModalCadOpen} // Corrigi 'open' para 'visible'
                onOk={handleOkModalCad}
                onCancel={handleCancelModalCad}
                style={{ top: 20 }}
            >
                <Form
                    ref={formRef}
                    name="basic"
                    labelCol={{
                        span: 20,
                    }}
                    style={{
                        width: '100%',
                        padding: '20px'
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    layout='vertical'

                >
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item
                            label="CEP"
                            name="cep"
                            style={{ flex: 1 }}
                        >
                            <Input onKeyUp={handleCepChange} />
                        </Form.Item>
                        <Form.Item
                            label="Endereço"
                            name="endereco"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, informe o endereço do imóvel!',
                                },
                            ]}
                            style={{ flex: 3 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Número"
                            name="numero"
                            style={{ flex: 1 }}
                        >
                            <Input />
                        </Form.Item>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item
                            label="Complemento"
                            name="complemento"
                            style={{ flex: 1 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Bairro"
                            name="bairro"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, informe o bairro do imóvel!',
                                },
                            ]}
                            style={{ flex: 2 }}
                        >
                            <Input />
                        </Form.Item>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item
                            label="Cidade"
                            name="cidade"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, informe a cidade do imóvel!',
                                },
                            ]}
                            style={{ flex: 2 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Estado"
                            name="estado"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, informe o estado do imóvel!',
                                },
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value="AC">Acre</Select.Option>
                                <Select.Option value="AL">Alagoas</Select.Option>
                                <Select.Option value="AP">Amapá</Select.Option>
                                <Select.Option value="AM">Amazonas</Select.Option>
                                <Select.Option value="BA">Bahia</Select.Option>
                                <Select.Option value="CE">Ceará</Select.Option>
                                <Select.Option value="DF">Distrito Federal</Select.Option>
                                <Select.Option value="ES">Espírito Santo</Select.Option>
                                <Select.Option value="GO">Goiás</Select.Option>
                                <Select.Option value="MA">Maranhão</Select.Option>
                                <Select.Option value="MT">Mato Grosso</Select.Option>
                                <Select.Option value="MS">Mato Grosso do Sul</Select.Option>
                                <Select.Option value="MG">Minas Gerais</Select.Option>
                                <Select.Option value="PA">Pará</Select.Option>
                                <Select.Option value="PB">Paraíba</Select.Option>
                                <Select.Option value="PR">Paraná</Select.Option>
                                <Select.Option value="PE">Pernambuco</Select.Option>
                                <Select.Option value="PI">Piauí</Select.Option>
                                <Select.Option value="RJ">Rio de Janeiro</Select.Option>
                                <Select.Option value="RN">Rio Grande do Norte</Select.Option>
                                <Select.Option value="RS">Rio Grande do Sul</Select.Option>
                                <Select.Option value="RO">Rondônia</Select.Option>
                                <Select.Option value="RR">Roraima</Select.Option>
                                <Select.Option value="SC">Santa Catarina</Select.Option>
                                <Select.Option value="SP">São Paulo</Select.Option>
                                <Select.Option value="SE">Sergipe</Select.Option>
                                <Select.Option value="TO">Tocantins</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Descrição"
                        name="descricao"
                    >

                        <TextArea rows={3} style={{ resize: 'none' }} />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item
                            label="Quartos"
                            name="quartos"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value="1">1</Select.Option>
                                <Select.Option value="2">2</Select.Option>
                                <Select.Option value="3">3</Select.Option>
                                <Select.Option value="4">4</Select.Option>
                                <Select.Option value="5">5+</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Banheiros"
                            name="banheiros"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value="1">1</Select.Option>
                                <Select.Option value="2">2</Select.Option>
                                <Select.Option value="3">3</Select.Option>
                                <Select.Option value="4">4</Select.Option>
                                <Select.Option value="5">5+</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Vagas de Garagem"
                            name="garagem"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value="0">Não tem</Select.Option>
                                <Select.Option value="1">1</Select.Option>
                                <Select.Option value="2">2</Select.Option>
                                <Select.Option value="3">3</Select.Option>
                                <Select.Option value="4">4</Select.Option>
                                <Select.Option value="5">5+</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Valor do Aluguel"
                            name="valor_aluguel"
                            style={{ flex: 2 }}
                        >
                            <Input />
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Outras Características"
                        name="outras_caracteristicas"
                    >
                        <TextArea rows={3} style={{ resize: 'none' }} />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Form.Item
                            label="Mobiliado"
                            name="mobiliado"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value="nao">Não</Select.Option>
                                <Select.Option value="sim">Sim</Select.Option>

                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, informe o status do imóvel!',
                                },
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value="locado">Locado</Select.Option>
                                <Select.Option value="vago">Vago</Select.Option>
                                <Select.Option value="manutencao">Manutenção</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
            <Modal
                width={1000}
                title="Editar Imóvel"
                open={isModalEditOpen}
                onOk={handleOkModalEdit}
                onCancel={handleCancelModalEdit}
                style={{ top: 20 }}
            >
                <Form
                    ref={formRefEdit}
                    name="edit"
                    initialValues={editImovel}
                    onValuesChange={(changedValues, allValues) => {
                        setEditImovel(allValues);
                    }}
                    autoComplete="off"
                    layout='vertical'
                >
                    <Form.Item
                        label="ID"
                        name="id"
                    >
                        <Input
                            value={localEditImovel ? localEditImovel.id : ''}
                            disabled={true}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Endereço"
                        name="endereco"
                        rules={[{ required: true, message: 'Por favor, insira o endereço do imóvel!' }]}
                    >
                        <Input
                            value={localEditImovel ? localEditImovel.endereco : ''}
                            onChange={(e) => handleLocalFieldChange(e, 'endereco')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default Imoveis;
