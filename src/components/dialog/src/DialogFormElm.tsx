// src/components/DialogForm/DialogFormElm.tsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Modal, Drawer, Button } from 'antd';

export interface DialogFormElmProps {
  /** 子组件 */
  component: React.ComponentType<any>;
  /** 传递给子组件的参数 */
  params?: Record<string, any>;
  /** 样式类名 */
  className?: string;
  /** 模态框样式类名 */
  dialogClassName?: string;
  /** 宽度 */
  width?: string | number;
  /** 标题 */
  title?: string;
  /** 是否使用 Drawer */
  isDrawer?: boolean;
  /** 类型 */
  type?: 'normal' | 'gallery';
  /** 确认回调 */
  onOkCallback?: (result: any) => void;
  /** 触发元素 */
  children?: React.ReactNode;
}

export interface DialogFormElmRef {
  show: () => void;
  close: () => void;
}

const DialogFormElm = forwardRef<DialogFormElmRef, DialogFormElmProps>((props, ref) => {
  const {
    component: Component,
    params = {},
    className = '',
    dialogClassName = '',
    width = '800px',
    title = '',
    isDrawer = false,
    type = 'normal',
    onOkCallback,
    children,
  } = props;

  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [okDisabled, setOkDisabled] = useState(false);

  const submitFormRef = React.useRef<any>(null);

  useImperativeHandle(ref, () => ({
    show: () => {
      setLoaded(true);
      setVisible(true);
    },
    close: () => setVisible(false),
  }));

  const handleShow = () => {
    setLoaded(true);
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleOk = () => {
    if (submitFormRef.current?.onFormSubmit) {
      submitFormRef.current.onFormSubmit();
    }
  };

  const submitCallback = (result: any) => {
    if (!result.code) {
      setVisible(false);
      setConfirmLoading(false);
      onOkCallback?.(result);
    }
  };

  const handleOkType = (type: boolean) => {
    setOkDisabled(!type);
  };

  // 计算属性和样式
  const computedWidth = type === 'gallery' ? '811px' : width;
  const computedTitle = type === 'gallery' ? '相册' : title;
  const computedClassName = type === 'gallery'
    ? `${dialogClassName} lyecs-modal-gallery noPadding`
    : dialogClassName;

  const childParams = {
    ...params,
    isDialog: true,
    submitCallback,
    show: handleShow,
    close: handleClose,
    okType: handleOkType,
    confirmLoading,
    setConfirmLoading,
  };

  const modalProps: any = {
    open: visible,
    onCancel: handleClose,
    confirmLoading,
    width: computedWidth,
    title: computedTitle,
    destroyOnClose: true,
    className: computedClassName,
    footer: (
      <>
        <Button style={{ marginRight: 12 }} onClick={handleClose}>
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

  return (
    <>
      <div
        className={`dialog-link ${className}`}
        style={{ display: 'inline-flex' }}
        onClick={handleShow}
      >
        {children}
      </div>
      {loaded && (isDrawer ? (
        <Drawer {...modalProps}>
          <Component ref={submitFormRef} {...childParams} />
        </Drawer>
      ) : (
        <Modal {...modalProps} onOk={handleOk}>
          <Component ref={submitFormRef} {...childParams} />
        </Modal>
      ))}
    </>
  );
});

DialogFormElm.displayName = 'DialogFormElm';

export default DialogFormElm;