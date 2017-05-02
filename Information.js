/**
 * @file Information
 * @author yaokun
 */

import {Component, observer, inject, h, consts} from 'utils/erp';
import {Section, Panel, formItemRenderer, Modal, formItemValidator, Message} from 'common/comps/default';
import style from './page-style.use.less';
import {loadDetailData} from './Utils';
import {UploadErrorState} from './app-state';

@inject(['app']) @observer
export default class Information extends Component {

    constructor(props) {
        super(props);
        this.localState = new UploadErrorState();
        this.closeUploadErrorModal = this.closeUploadErrorModal.bind(this);
    }

    componentWillMount() {
        style.use();
    }

    componentWillUnmount() {
        style.unuse();
    }

    componentDidMount() {
    }

    componentWillReceiveProps() {
    }

    toDownload() {
        window.open('/ivt/project/download/example');
    }

    uploadSuccess(res) {
        loadDetailData(res.data, this.props.appState);
        Message.done(res.message || '上传成功');
    }

    uploadError(res) {
        const message = res.data[0] && res.data[0].defaultMessage || '上传失败';
        const [content1, content2] = message.split('。');
        this.localState.setProps('content1', content1);
        this.localState.setProps('content2', content2);
        this.localState.setProps('showUploadErrorModal', true);
    }

    getActionsConfigs() {
        const app = this.props.app;
        const configs = [
            {
                type: 'button-group',
                options: [
                    {
                        type: 'upload',
                        label: '上传',
                        iconType: 'upload',
                        btnType: 'ghost',
                        size: 'sm',
                        url: '/ivt/project/import/single',
                        success: res => this.uploadSuccess(res),
                        error: res => this.uploadError(res),
                        params: [{name: 'projectId', value: this.props.appState.projectId || ''}],
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_UPLOADPROJECTCREATE),
                        isDisable: this.props.appState.uploadDisabled
                    },
                    {
                        label: '下载',
                        iconType: 'download',
                        btnType: 'ghost',
                        size: 'sm',
                        onClick: this.toDownload,
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_UPDOWNPROJECTCREATE),
                        disabled: this.props.appState.downloadDisabled
                    }
                ]
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getInformationConfigs() {
        const configs = [
            {
                key: 'projectName',
                type: 'text',
                className: 'require projectName',
                title: '项目名称',
                disabled: this.props.appState.disabled
            },
            {
                key: 'projectCode',
                type: 'text',
                className: 'projectCode',
                title: '项目编号',
                disabled: true
            }
        ];
        const requiredKeys = {
            projectName: true
        };
        return {
            stateObj: this.props.appState,
            configs,
            requiredKeys
        };
    }

    getUploadErrorModalFooter() {
        const configs = [
            {
                type: 'button-group',
                title: ' ',
                leftColWidth: 6,
                rightColWidth: 16,
                options: [
                    {
                        label: '确认',
                        btnType: 'primary',
                        onClick: this.closeUploadErrorModal
                    },
                    {
                        label: '取消',
                        onClick: this.closeUploadErrorModal
                    }
                ]
            }
        ];
        return {
            stateObj: this.localState,
            configs
        };
    }

    closeUploadErrorModal() {
        this.localState.init();
    }

    render() {
        const isActive = this.props.isActive;
        const {content1, content2} = this.localState;
        const panelParams = {
            title: '基本信息',
            className: isActive ? 'active-workspace button-section' : 'button-section',
            action: formItemRenderer(this.getActionsConfigs())
        };
        formItemValidator.setStateObj(this.props.appState, {
            requiredKeys: this.getInformationConfigs().requiredKeys,
            errorKeys: this.props.appState.errorKeys
        });
        return h.div('index', {},
            h(Panel, panelParams,
                h(Section, {column: 2},
                    formItemValidator.renderer(this.getInformationConfigs().configs)
                ),
            ),
            h(Modal,
                {
                    shouldShow: this.localState.showUploadErrorModal,
                    onClose: this.closeUploadErrorModal,
                    className: 'project-manage upload-error-modal',
                    size: 'xs',
                    footer: h(Section, {column: 1, className: 'button-group'},
                        formItemRenderer(this.getUploadErrorModalFooter())
                    )
                },
                h.div('modal-content', {},
                    h.div('tips-info', {},
                        h.i('icon-image icon-image-error'),
                        h.span('info', {}, content1)
                    ),
                    content2 ? h.div('confirm-info', {},
                            h.span({}, content2)
                        ) : null
                )
            )
        );
    }
}
