import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, ConfigProvider, Typography } from 'antd';
const { Header, Sider, Content } = Layout;

import { MyContext } from '../contexts/MyContext';
import { useContext } from 'react';

const { Title } = Typography;

const Template = (props) => {
  const { logoutUser } = useContext(MyContext);
  const [collapsed, setCollapsed] = useState(false);
  const { Title } = Typography;
  const { theme } = props;

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu
          style={{ backgroundColor: theme.token.colorBgMenus, height: '100vh', color: theme.token.colorTextBase }}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'nav 1',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'nav 2',
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: 'nav 3',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            backgroundColor: theme.token.colorBgMenus,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: '24px',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Button onClick={logoutUser} color="primary" variant="ghost">
            Sair
          </Button>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            height: 'calc(100vh - 112px)',

          }}
        >
          <h1>Template</h1>
        </Content>
      </Layout>
    </Layout>
  )

}

export default Template;