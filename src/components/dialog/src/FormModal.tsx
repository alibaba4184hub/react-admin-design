// src/components/DialogForm/FormModal.tsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Modal, Drawer, Button, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ModalProps, DrawerProps } from 'antd';

export interface FormModalProps {
  /** 子组件 */
  component: React.ComponentType<any>;
  /** 传递给子组件的参数 */
  params?: Record<string, any>;
  /** 是否使用 Drawer */
  isDrawer?: boolean;
  /** 模态框宽度 */
  width?: string | number;
  /** 模态框标题 */
  title?: string;
  /** 确认回调 */
  okCallback?: (result: any) => void;
  /** 样式类名 */
  className?: string;
  /** 类型 */
  type?: 'normal' | 'gallery' | 'galleryVideo';
}

export interface FormModalRef {
  show: () => void;
  close: () => void;
}

const FormModal = forwardRef<FormModalRef, FormModalProps>((props, ref) => {
  const {
    component: Component,
    params = {},
    isDrawer = false,
    width = '800px',
    title = '',
    okCallback,
    className = '',
    type = 'normal',
  } = props;

  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [okDisabled, setOkDisabled] = useState(false);

  const submitFormRef = React.useRef<any>(null);

  // 暴露方法
  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
    close: () => setVisible(false),
  }));

  const handleClose = () => {
    setVisible(false);
  };

  const handleOk = () => {
    if (submitFormRef.current?.onFormSubmit) {
      submitFormRef.current.onFormSubmit();
    } else {
      submitCallback({});
    }
  };

  const submitCallback = (result: any) => {
    setVisible(false);
    okCallback?.(result);
  };

  const handleOkType = (type: boolean) => {
    setOkDisabled(!type);
  };

  // 子组件参数
  const childParams = {
    ...params,
    isDialog: true,
    submitCallback,
    show: () => setVisible(true),
    close: handleClose,
    okType: handleOkType,
    confirmLoading,
    setConfirmLoading,
  };

  // 计算宽度和类名
  const computedWidth = type === 'gallery' ? '811px' : width;
  const computedClassName = type === 'gallery' 
    ? `${className} lyecs-modal-gallery noPadding` 
    : className;

  const modalProps: ModalProps | DrawerProps = {
    open: visible,
    onCancel: handleClose,
    confirmLoading,
    width: computedWidth,
    title: type === 'gallery' ? '相册' : title,
    destroyOnClose: true,
    className: computedClassName,
    footer: (
      <>
        <Button style={{ marginRight: 8 }} onClick={handleClose}>
          取消
        </Button>
        <Button
          type="primary"
          disabled={okDisabled}
          loading={confirmLoading}
          onClick={handleOk}
        >
          确认
        </Button>
      </>
    ),
  };

  return isDrawer ? (
    <Drawer {...modalProps as DrawerProps}>
      <ConfigProvider locale={zhCN}>
        <Component ref={submitFormRef} {...childParams} />
      </ConfigProvider>
    </Drawer>
  ) : (
    <Modal {...modalProps as ModalProps} onOk={handleOk}>
      <ConfigProvider locale={zhCN}>
        <Component ref={submitFormRef} {...childParams} />
      </ConfigProvider>
    </Modal>
  );
});

FormModal.displayName = 'FormModal';

export default FormModal;