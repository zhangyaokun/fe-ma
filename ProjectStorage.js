/**
 * @file projectStorage 项目入库
 * @author yaokun
 */
import agent from 'utils/ajax-agent';
import {action, toJS, observable} from 'mobx';
import {Component, observer, inject, h, c, reactUtils, consts} from 'utils/erp';
import {
    Section,
    Panel,
    formItemRenderer,
    formItemValidator,
    Select,
    Text,
    Modal,
    Message,
    PlainTable
} from 'common/comps/default';
import {loadDetailData, loadStageData, iconFn} from './Utils';
import {ModalModel} from './app-state';
import style from './page-style.use.less';
import moment from 'moment';
import urlUtils from 'utils/url-utils';
import fileStyle from '@befe/erp-comps/complex/WrapperUpload/component.use.less';
import {highlight} from '@befe/utils/lib/highlight-tips';
const modalModel = new ModalModel();

@inject(['app']) @observer
export default class ProjectStorage extends Component {
    @observable id = null;
    @observable saveClick = false;
    @observable submitClick = false;
    @observable nextClick = false;
    @observable othSubmitClick = false;
    @observable nextShouldHide = false;
    @observable shouldHide = false;
    @observable attBtnClick = false;
    @observable maxCount = 15;
    @observable showMessageModal = false;
    @observable maLeaderIdError = false;
    @observable projectSponsorIdError = false;
    @observable commonNameError = false;
    @observable messageConfirm = false;
    @observable attamentTips = true;

    @action setProps(key, val) {
        this[key] = val;
    }

    @action setId(key, value) {
        this[key] = value;
    }

    componentWillMount() {
        style.use();
        fileStyle.use();
    }

    componentWillUnmount() {
        style.unuse();
        fileStyle.unuse();
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.hasActive) {
            this.setId('id', null);
        }
    }

    constructor(props) {
        super(props);
        this.modalModel = modalModel;

        reactUtils.bindAll(this,
            'onSubmit', 'onSave', 'onNext', 'openModal', 'closeModal',
            'submitModal', 'othOnSubmit', 'othOnCancel',
            'renderCompanyCommonNameItem',
            'detailStatusCodeChange', 'detailStatusCodeSelect',
            'closeMessageModal', 'messageModalConfirm'
        );
    }

    // 操作按钮
    getButtonGroup() {
        const app = this.props.app;
        const buttonConfigs = [
            {
                type: 'button-group',
                title: ' ',
                // leftColWidth: 4,
                options: [
                    {
                        label: '提交',
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_CONFIRM) || this.shouldHide,
                        onClick: this.onSubmit,
                        btnType: 'primary',
                        disabled: this.submitClick
                    },
                    {
                        label: '暂存',
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_SAVE) || this.shouldHide,
                        onClick: this.onSave,
                        disabled: this.saveClick
                    },
                    {
                        label: '下一步',
                        btnType: 'accept',
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_NEXT) || this.nextShouldHide,
                        onClick: this.onNext,
                        disabled: this.nextClick
                    }
                ]
            }
        ];
        const othButtonConfigs = [
            {
                type: 'button-group',
                title: ' ',
                // leftColWidth: 4,
                options: [
                    {
                        label: '提交',
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_CONFIRM) || this.shouldHide,
                        onClick: this.othOnSubmit,
                        btnType: 'primary',
                        disabled: this.othSubmitClick
                    },
                    {
                        label: '取消',
                        onClick: this.othOnCancel,
                        shouldHide: this.shouldHide
                    }
                ]
            }
        ];
        const configs = this.props.appState.buttonShow ? buttonConfigs : othButtonConfigs;
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    @observable companyNameSelectedIndex = 0;
    companyCommonNameSuggest = null;

    @action setCompanyNameSelectedIndex(idx) {
        this.companyNameSelectedIndex = idx;
    }

    @action handleCompanySelected(item) {
        // @review: 简直了... 清空时, item 居然是 {code: '', text: ''} ...

        this.props.appState.setProps('commonName', item.commonName);
        this.props.appState.setProps('companyId', item.companyId);

        if (!item.hasOwnProperty('code')) {
            this.props.appState.setProps('companyName', item.companyName);
        }

        // @review: 自然就有隐藏 suggest result 的需求
        if (this.companyCommonNameSuggest) {
            this.companyCommonNameSuggest.updateShowPopup(false);
        }
    }

    renderCompanyCommonNameItem(item) {
        return h.span({},
            h.span('suggest-common-name', {},
                highlight(item.commonName, this.props.appState.commonName, 'erp-highlight-tips')),
            h.span('suggest-company-name', {title: item.companyName},
                highlight(item.companyName, this.props.appState.commonName, 'erp-highlight-tips'))
        );
    }

    getCommonName() {
        const configs = [
            {
                key: 'commonName',
                type: 'suggest',
                title: '公司常用名',
                className: 'require active commonName',
                sugUrl: '/suggest/company',
                shouldAllowInput: true,
                inputValue: this.props.appState.commonName,
                inputParamName: 'commonName',
                renderItem: this.renderCompanyCommonNameItem,
                resultWidth: 380,
                hasError: this.commonNameError,
                needNoDataTips: true,
                disabled: this.props.appState.disabled,
                onActiveIndexChange: index => this.setCompanyNameSelectedIndex(index),
                onSelected: item => this.handleCompanySelected(item),
                onChanged: val => {
                    this.props.appState.setProps('commonName', val);
                    this.setProps('commonNameError', false);
                },
                // @review: 是否会有内存泄漏问题???
                attachHandler: handlers => {
                    this.companyCommonNameSuggest = handlers;
                }
            }
        ];
        return {
            stataobj: this.props.appState,
            configs
        };
    }

    getGroup1() {
        const configs = [
            {
                key: 'companyName',
                type: 'suggest',
                title: '公司名称',
                className: 'companyName',
                sugUrl: '/suggest/company',
                needNoDataTips: true,
                shouldAllowInput: true,
                inputParamName: 'companyName', // 像后台穿参的字段名称
                inputValue: this.props.appState.companyName,
                disabled: this.props.appState.disabled,
                onSelected: item => this.props.appState.setProps('companyName', item.companyName),
                renderItem: item =>
                    highlight(item.companyName, this.props.appState.companyName, 'erp-highlight-tips'),
                onChanged: val => this.props.appState.setProps('companyName', val)
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getGroup2() {
        const configs = [
            {
                key: 'keyInfSummary',
                type: 'textarea',
                leftColWidth: 4,
                rightColWidth: 18,
                className: 'require keyInfSummary',
                disabled: this.props.appState.disabled,
                maxCount: 200,
                title: '关键信息摘要'
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getGroup3() {
        const configs = [
            {
                key: 'projectSourceCode',
                type: 'select',
                title: '项目来源',
                className: 'require projectSourceCode',
                disabled: this.props.appState.disabled,
                options: this.props.appState.sourceList
            },
            {
                key: 'buOwner',
                type: 'select',
                className: 'require buOwner',
                disabled: this.props.appState.disabled,
                title: '所属BU',
                options: this.props.appState.maBuList
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    // suggest 赋值
    maLeaderIdSelected(item) {
        if (item.username) {
            this.props.appState.setProps('maLeaderId', item.username);
            this.props.appState.setProps('maLeaderName', item.name);
            this.props.appState.setProps('maLeaderDepart', item.departmentName);
            this.setProps('maLeaderIdError', false);
        }
        else {
            this.props.appState.setProps('maLeaderId', '');
            this.props.appState.setProps('maLeaderName', '');
            this.props.appState.setProps('maLeaderDepart', '');
        }
    }

    pmoLeaderIdSelected(item) {
        if (item.username) {
            this.props.appState.setProps('pmoLeaderId', item.username);
            this.props.appState.setProps('pmoLeaderName', item.name);
            this.props.appState.setProps('pmoLeaderDepart', item.departmentName);
        }
        else {
            this.props.appState.setProps('pmoLeaderId', '');
            this.props.appState.setProps('pmoLeaderName', '');
            this.props.appState.setProps('pmoLeaderDepart', '');
        }
    }

    projectSponsorIdSelected(item) {
        if (item.username) {
            this.props.appState.setProps('projectSponsorId', item.username);
            this.props.appState.setProps('projectSponsorName', item.name);
            this.props.appState.setProps('projectSponsorDepart', item.departmentName);
            this.setProps('projectSponsorIdError', false);
        }
        else {
            this.props.appState.setProps('projectSponsorId', '');
            this.props.appState.setProps('projectSponsorName', '');
            this.props.appState.setProps('projectSponsorDepart', '');
        }
    }

    getInputVal(name, id, depart) {
        let val = this.props.appState[name] || '';
        if (this.props.appState[id] && this.props.appState[depart]) {
            val += '(' + this.props.appState[id] + ',' + this.props.appState[depart] + ')';
        }
        else if (this.props.appState[id] || this.props.appState[depart]) {
            let val2 = this.props.appState[id] || this.props.appState[depart];
            val += val ? '(' + val2 + ')' : val2;
        }
        return val;
    }

    getGroupSuggest() {
        const configs = [
            {
                key: 'maLeaderId',
                title: 'M&A负责总监',
                type: 'user-suggest',
                className: 'require clear maLeaderId',
                inputParamName: 'inputVal', // 像后台穿参的字段名称
                sugUrl: '/suggest/user/ma',
                needNoDataTips: true,
                hasError: this.maLeaderIdError,
                disabled: this.props.appState.disabled,
                // allowClear: this.allowClear(),
                shouldAllowInput: false,
                onChanged: val => {
                    this.props.appState.setProps('maLeaderName', val);
                    this.props.appState.setProps('maLeaderId', '');
                    this.props.appState.setProps('maLeaderDepart', '');
                },
                inputValue: this.getInputVal('maLeaderName', 'maLeaderId', 'maLeaderDepart'),
                onSelected: item => this.maLeaderIdSelected(item),
                renderItem: item =>
                    highlight(item.username ? `${item.name}(${item.username},${item.departmentName})` : '',
                        this.props.appState.maLeaderName,
                        'erp-highlight-tips')
            },
            {
                key: 'pmoLeaderId',
                title: 'PMO负责人',
                type: 'user-suggest',
                inputParamName: 'inputVal', // 像后台穿参的字段名称
                sugUrl: '/suggest/user',
                className: 'clear pmoLeaderId',
                needNoDataTips: true,
                // allowClear: this.allowClear(),
                shouldAllowInput: false,
                disabled: this.props.appState.disabled,
                inputValue: this.getInputVal('pmoLeaderName', 'pmoLeaderId', 'pmoLeaderDepart'),
                onChanged: val => {
                    this.props.appState.setProps('pmoLeaderName', val);
                    this.props.appState.setProps('pmoLeaderId', '');
                    this.props.appState.setProps('pmoLeaderDepart', '');
                },
                onSelected: item => this.pmoLeaderIdSelected(item),
                renderItem: item =>
                    highlight(item.username ? `${item.name}(${item.username},${item.departmentName})` : '',
                        this.props.appState.pmoLeaderName,
                        'erp-highlight-tips')
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getProjectSponsorId() {
        const configs = [
            {
                key: 'projectSponsorId',
                title: '项目发起人',
                type: 'user-suggest',
                className: 'require clear projectSponsorId',
                inputParamName: 'inputVal', // 像后台穿参的字段名称
                sugUrl: '/suggest/user',
                hasError: this.projectSponsorIdError,
                shouldAllowInput: false,
                // allowClear: this.allowClear(),
                disabled: this.props.appState.disabled,
                needNoDataTips: true,
                inputValue: this.getInputVal('projectSponsorName', 'projectSponsorId', 'projectSponsorDepart'),
                onChanged: val => {
                    this.props.appState.setProps('projectSponsorName', val);
                    this.props.appState.setProps('projectSponsorId', '');
                    this.props.appState.setProps('projectSponsorDepart', '');
                },
                onSelected: item => this.projectSponsorIdSelected(item),
                renderItem: item =>
                    highlight(item.username ? `${item.name}(${item.username},${item.departmentName})` : '',
                        this.props.appState.projectSponsorName,
                        'erp-highlight-tips')
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getProjectDate() {
        const configs = [
            {
                key: 'projectDate',
                type: 'calendar',
                className: 'require projectDate',
                disabled: this.props.appState.disabled,
                title: '入库时间'
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getGroup4() {
        const configs = [
            {
                key: 'busiComments',
                type: 'textarea',
                leftColWidth: 4,
                rightColWidth: 18,
                className: 'require textarea-max busiComments',
                disabled: this.props.appState.disabled,
                maxCount: 500,
                title: '业务描述'
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getGroup5() {
        const configs = [
            {
                key: 'dealRationale',
                type: 'textarea',
                className: 'textarea-max dealRationale',
                leftColWidth: 4,
                rightColWidth: 18,
                disabled: this.props.appState.disabled,
                maxCount: 500,
                title: 'Deal Rationale'
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getGroup6() {
        const configs = [
            {
                key: 'approveStatusCode',
                type: 'select',
                leftColWidth: 4,
                rightColWidth: 2,
                className: 'require approveStatusCode',
                disabled: this.props.appState.disabled,
                title: '结论',
                onChange: item => this.detailStatusCodeChange(item),
                onSelect: item => this.detailStatusCodeSelect(item),
                options: this.props.appState.phaseStatusCodeToNames
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    detailStatusCodeChange(item) {
        if (item === 'REFUSE') {
            this.setProps('nextShouldHide', true);
        }
        else {
            this.setProps('nextShouldHide', false);
        }
        this.props.appState.changeOneErrorKey('approveStatusCode', false);
    }

    detailStatusCodeSelect(item) {
        this.props.appState.setProps('approveStatusCode', this.props.appState.phaseStatusCodeToNames[item].code);
        this.props.appState.setProps('approveStatusCodeName', this.props.appState.phaseStatusCodeToNames[item].code);
    }

    getGroup7() {
        const configs = [
            {
                key: 'approveReason',
                type: 'textarea',
                title: '通过/未通过原因',
                leftColWidth: 4,
                rightColWidth: 18,
                maxCount: 200,
                disabled: this.props.appState.disabled,
                className: 'approveReason'
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    getGroup8() {
        const app = this.props.app;
        const configs = [
            {
                type: 'button',
                title: '附件',
                leftColWidth: 4,
                label: '上传附件',
                size: 'sm',
                className: 'button-attachment',
                iconType: 'attachAdd',
                disabled: this.props.appState.disabled,
                // btnType: 'accept',
                shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_UPLOADATTACHMENT),
                onClick: this.openModal
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    // 附件modal
    getModalGroup() {
        const configs = [
            {
                key: 'attachmentDate',
                type: 'calendar',
                leftColWidth: 6,
                rightColWidth: 16,
                className: 'require attachment-row attachmentDate',
                title: '时间'
            },
            {
                key: 'attachmentTypeCode',
                type: 'select',
                leftColWidth: 6,
                rightColWidth: 16,
                className: 'require attachmentTypeCode',
                title: '类型',
                options: this.props.appState.attachmentType
            },
            {
                key: 'attachmentComments',
                type: 'textarea',
                className: 'attachmentComments',
                leftColWidth: 6,
                rightColWidth: 16,
                maxCount: 200,
                title: '摘要'
            },
            {
                type: 'wrapper-upload',
                title: '上传附件',
                leftColWidth: 6,
                rightColWidth: 16,
                label: '上传附件',
                className: 'attachment-button',
                iconType: 'attachAdd',
                // btnType: 'ghost',
                size: 'sm',
                isSubmit: this.modalModel.isSubmit,
                url: '/attach/upload',
                maxSize: 10240,
                tips: this.attamentTips ? '提示：单个附件大小 <= 10M' : '',
                onUploadChange: res => this.onUploadChange(res),
                params: [
                    {
                        name: 'sourceType',
                        value: this.props.appState.phaseCodeToNames && this.props.appState.phaseCodeToNames[0]
                            ? this.props.appState.phaseCodeToNames[0].code : ''
                    },
                    {name: 'sourceId', value: this.props.appState.projectId || ''},
                    {name: 'attachmentTypeCode', value: this.modalModel.attachmentTypeCode || ''},
                    {name: 'attachmentDate', value: this.modalModel.attachmentDate || ''},
                    {name: 'attachmentComments', value: this.modalModel.attachmentComments || ''}
                ],
                success: res => this.modalSubmitSuccess(res),
                error: res => this.modalSubmitError(res)
            }
        ];
        return {
            stateObj: this.modalModel,
            configs: configs
        };
    }

    onUploadChange(res) {
        if (!res.fileName) {
            this.setProps('attBtnClick', true);
            this.setProps('attamentTips', true);
        }
        else {
            this.setProps('attBtnClick', false);
            this.setProps('attamentTips', false);
        }
    }

    // 上传成功
    modalSubmitSuccess(res) {
        Message.done('上传成功');
        this.modalModel.setProps('isSubmit', false);
        this.props.appState.addAttachmentItem(res.data);
        this.closeModal();
        this.setProps('attBtnClick', true);
    }

    // 长传失败
    modalSubmitError(res) {
        Message.error(res.data.map(it => it.defaultMessage).join(','));
        this.modalModel.setProps('isSubmit', false);
        this.setProps('attBtnClick', false);
        console.log(res);
    }

    // 附件确认取消按钮modal
    getModalButton() {
        const configs = [
            {
                type: 'button-group',
                title: ' ',
                leftColWidth: 4,
                rightColWidth: 16,
                options: [
                    {
                        label: '确认',
                        btnType: 'primary',
                        onClick: this.submitModal,
                        disabled: this.attBtnClick
                    },
                    {
                        label: '取消',
                        onClick: this.closeModal
                        // disabled: this.attBtnClick
                    }
                ]
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    // 附件确认上传
    submitModal() {
        this.setProps('attBtnClick', true);
        this.modalModel.setProps('isSubmit', true);
    }

    // 提交
    onSubmit() {
        this.setProps('submitClick', true);
        const {
            appState: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        this.suggestHasError(param.data);
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        this.props.appState.clearErrorkey();
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_detail/submit_detail', param)
                .then(result => {
                    if (result.status === 'ok' && result.data) {
                        loadDetailData(result.data, this.props.appState);
                        // 跳转至详情页
                        urlUtils.jump('detail/' + result.data.projectId);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appState.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data[0].defaultMessage);
                    }
                    this.setProps('submitClick', false);
                });
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('submitClick', false);
        }
    }

    // 暂存
    onSave() {
        this.setProps('saveClick', true);
        const {
            appState: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        this.suggestHasError(param.data);
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        this.props.appState.clearErrorkey();
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_detail/save_detail', param)
                .then(action(result => {
                    if (result.status === 'ok' && result.data) {
                        Message.done('暂存成功');
                        loadDetailData(result.data, this.props.appState);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appState.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data[0].defaultMessage);
                    }
                    this.setProps('saveClick', false);
                }));
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('saveClick', false);
        }
    }

    // 下一步
    onNext() {
        this.setProps('nextClick', true);
        let {
            appState: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        this.suggestHasError(param.data);
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        this.props.appState.clearErrorkey();
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_detail/next_step', param)
                .then(action(result => {
                    if (result.status === 'ok' && result.data) {
                        loadDetailData(result.data, this.props.appState);
                        if (result.data.detailStatusCode !== 'REFUSE') {
                            this.props.appState.changeIndex();
                            const stageCode = result.data.phaseCodeToNames[1].code;
                            this.id = setTimeout(() => {
                                this.props.changeWindow && this.props.changeWindow(stageCode);
                            }, 1);
                            // 访问第二阶段
                            if (this.props.appState.projectId) {
                                this.props.appState.setProps('buttonGroupShow', false);
                                const secParams = {
                                    data: {
                                        projectId: this.props.appState.projectId,
                                        stageCode: stageCode
                                    }
                                };
                                agent.post('/ivt/project/edit_stage/load_stage', secParams)
                                    .then(result => {
                                        if (result.status === 'ok' && result.data) {
                                            loadStageData(result.data, this.props.appScreen);
                                        }
                                        else {
                                            Message.error(result.data.map(it => it.defaultMessage).join(','));
                                        }
                                    });
                            }
                        }
                        this.props.appState.setProps('buttonHide', true);
                        this.props.appState.setProps('disabled', true);
                        this.props.appState.setProps('uploadDisabled', true);
                        this.props.appState.setProps('downloadDisabled', true);
                        this.setProps('shouldHide', true);
                        this.setProps('nextShouldHide', true);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appState.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data[0].defaultMessage);
                    }
                    this.setProps('nextClick', false);
                }));
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('nextClick', false);
        }
    }

    // 编辑页入口进去后的提交
    othOnSubmit() {
        this.setProps('othSubmitClick', true);
        const {
            appState: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        this.suggestHasError(param.data);
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        this.props.appState.clearErrorkey();
        if (param.data.approveStatusCode === 'REFUSE') {
            this.setProps('showMessageModal', true);
            this.setProps('othSubmitClick', false);
            return;
        }
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_detail/submit_detail', param)
                .then(result => {
                    if (result.status === 'ok' && result.data) {
                        loadDetailData(result.data, this.props.appState);
                        // 跳转至详情页
                        urlUtils.jump('detail/' + result.data.projectId);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appState.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data[0].defaultMessage);
                    }
                    this.setProps('othSubmitClick', false);
                });
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('othSubmitClick', false);
        }
    }

    // 编辑页入库进去后的取消
    othOnCancel() {
        urlUtils.jump('detail/' + this.props.appState.projectId);
    }

    // 打开附件modal
    openModal() {
        const date = new Date();
        this.setProps('attBtnClick', true);
        this.setProps('attamentTips', true);
        this.modalModel.setProps('attachmentDate', moment(date).format('YYYY-MM-DD'));
        this.modalModel.setProps('shouldShowModal', true);
    }

    // 关闭附件modal
    closeModal() {
        this.modalModel.setProps('shouldShowModal', false);
        this.setProps('attBtnClick', false);
        this.modalModel.clear();
    }

    // 删除附件
    deleteAttachment(item) {
        const url = '/attach/remove/' + item.attachmentId;
        agent.get(url)
            .then(action(result => {
                if (result.status === 'ok') {
                    Message.done('删除成功');
                    this.props.appState.removeAttachmentItem(item);
                }
                else {
                    Message.error(result.message);
                }
            }));
    }

    // 附件list渲染页面
    getAttachmentList() {
        const lists = this.props.appState.attachments || [];
        return h.div('', {key: '1'},
            h.div('erp-col-4'),
            h.div('erp-col-18 upload upload-style', {},
                lists.map((item, idx) => {
                    let fileIcon = iconFn(item.attachmentFileType);
                    const iconClass = `file-type file-type-${fileIcon} file-name`;
                    const className = this.props.appState.disabled ? 'attach-item-disabled' : 'attach-item-file';
                    return h.span('attach-item', {key: idx},
                        h.span(iconClass, {}),
                        h.span(className, {title: '附件类型:' + item.attachmentTypeCodeName}, item.attachmentName),
                        this.props.appState.disabled
                            ? null : h.i('erp-icon erp-icon-remove remove',
                                {
                                    onClick: () => this.deleteAttachment(item)
                                })
                    );
                })
            )
        );
    }

    // // 金额输入 截取15位
    // piHandleBlur() {
    //     if (this.maxCount - this.props.appState.potentialInvestmentAmt.length >= 0) {
    //         this.props.appState.setProps('potentialInvestmentAmt', this.props.appState.potentialInvestmentAmt);
    //     }
    //     else {
    //         this.props.appState.setProps('potentialInvestmentAmt', this.props.potentialInvestmentAmt);
    //     }
    // }
    //
    // pmvHandleBlur() {
    //     if (this.maxCount - this.props.appState.preMoneyValuation.length >= 0) {
    //         this.props.appState.setProps('preMoneyValuation', this.props.appState.preMoneyValuation);
    //     }
    //     else {
    //         this.props.appState.setProps('preMoneyValuation', this.props.preMoneyValuation);
    //     }
    // }

    // model有问题 暂时去掉
    // 新需求  消息提示modal
    getMessageModal() {
        const configs = [
            {
                type: 'button-group',
                title: ' ',
                leftColWidth: 4,
                rightColWidth: 16,
                options: [
                    {
                        label: '确认',
                        btnType: 'primary',
                        onClick: this.messageModalConfirm,
                        disabled: this.messageConfirm
                    },
                    {
                        label: '取消',
                        onClick: this.closeMessageModal
                    }
                ]
            }
        ];
        return {
            stateObj: this.props.appState,
            configs
        };
    }

    // 消息modal确认
    messageModalConfirm() {
        const {
            appState: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        this.suggestHasError(param.data);
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        this.setProps('messageConfirm', true);
        this.props.appState.clearErrorkey();
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_detail/submit_detail', param)
                .then(result => {
                    if (result.status === 'ok' && result.data) {
                        loadDetailData(result.data, this.props.appState);
                        // 跳转至详情页
                        urlUtils.jump('detail/' + result.data.projectId);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appState.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data[0].defaultMessage);
                    }
                    this.setProps('messageConfirm', false);
                });
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('messageConfirm', false);
        }
    }

    // 关闭消息modal
    closeMessageModal() {
        this.setProps('showMessageModal', false);
        this.setProps('othSubmitClick', false);
    }

    getFormItemValidator() {
        const getGroup2 = this.getGroup2().configs;
        const getGroup3 = this.getGroup3().configs;
        const getProjectDate = this.getProjectDate().configs;
        const getGroup4 = this.getGroup4().configs;
        const getGroup6 = this.getGroup6().configs;
        let formItems = [];
        formItemValidator.setStateObj(this.props.appState, {
            requiredKeys: this.props.appState.requiredKeys,
            errorKeys: this.props.appState.errorKeys
        });
        formItems.push(formItemValidator.renderer(getGroup2));
        formItems.push(formItemValidator.renderer(getGroup3));
        formItems.push(formItemValidator.renderer(getProjectDate));
        formItems.push(formItemValidator.renderer(getGroup4));
        formItems.push(formItemValidator.renderer(getGroup6));
        return formItems;
    }

    // suggest 校验
    suggestHasError(value) {
        if (value.commonName === 'undefined' || value.commonName === undefined
            || value.commonName === ''
        ) {
            this.setProps('commonNameError', true);
        }
        else {
            this.setProps('commonNameError', false);
        }
        if (value.maLeaderId === 'undefined' || value.maLeaderId === undefined
            || value.maLeaderId === ''
        ) {
            this.setProps('maLeaderIdError', true);
        }
        else {
            this.setProps('maLeaderIdError', false);
        }
        if (value.projectSponsorId === 'undefined' || value.projectSponsorId === undefined
            || value.projectSponsorId === '') {
            this.setProps('projectSponsorIdError', true);
        }
        else {
            this.setProps('projectSponsorIdError', false);
        }
    }

    render() {
        const status = this.props.appState.detailStatusCodeName ? this.props.appState.detailStatusCodeName : '未开始';
        const panelParams = {
            title: '1/7 项目入库',
            className: this.props.appState.showIndex === 0 ? 'active-workspace not-before' : 'not-before'
        };
        return h.div({id: 'storage'},
            h(Panel, panelParams,
                h.span('', {
                    className: status === '已通过' ? 'title-sucStatus'
                        : status === '进行中' ? 'title-inStatus'
                            : status === '未通过' ? 'title-ovStatus' : 'title-status'
                }, status),
                h(Section, {column: 2},
                    formItemRenderer(this.getCommonName()),
                    formItemRenderer(this.getGroup1())
                ),
                h(Section, {column: 1},
                    this.getFormItemValidator()[0]
                ),
                h.div('line-thread', {}),
                h(Section, {column: 2},
                    this.getFormItemValidator()[1]
                ),
                h(Section, {column: 2},
                    formItemRenderer(this.getGroupSuggest())
                ),
                h(Section, {column: 2},
                    formItemRenderer(this.getProjectSponsorId()),
                    this.getFormItemValidator()[2]
                ),
                h(Section, {column: 1},
                    this.getFormItemValidator()[3]
                ),
                h(Section, {column: 1},
                    formItemRenderer(this.getGroup5())
                ),
                h.div('line-thread', {}),
                h(Section, {
                        layoutType: 'normal',
                        column: 2
                    },
                    h.div('', {},
                        h.div('erp-col-8 label-margin-infos', {},
                            h.label('', {}, 'Potential',
                                h.span('', {}), ' Investment Amount')),
                        h.div('erp-col-13', {},
                            h.div('erp-col-8', {},
                                h(Select,
                                    {
                                        onSelect: value => this.props.appState.setOthProps('piCurrencyCode', value),
                                        onChange: value => this.props.appState.setOthProps('piCurrencyCode', value),
                                        options: this.props.appState.currencyList,
                                        disabled: this.props.appState.disabled,
                                        value: this.props.appState.piCurrencyCode
                                    }
                                )
                            ),
                            h.div('erp-col-14 money', {},
                                h(Text,
                                    this.props.appState.potentialInvestmentAmt >= 0
                                        ? 'currencyText' : 'currencyText negative-value',
                                    {
                                        value: this.props.appState.potentialInvestmentAmt,
                                        disabled: this.props.appState.disabled,
                                        onChange: e => {
                                            let value = e.target.value;
                                            let newValue = null;
                                            let rgxNumber = /^[+-]?\d{0,11}(\.\d{0,2})?$/;
                                            if (rgxNumber.test(value)) {
                                                newValue = value;
                                            }
                                            if (/^[+]$/.test(value)) {
                                                newValue = 0;
                                            }
                                            if (newValue !== null) {
                                                this.props.appState.setOthProps('potentialInvestmentAmt', newValue);
                                            }
                                        }
                                        // @review: regular express 的书写
                                        // /^([+-]?0|[+-]?|[+-]?0\.\d?[1-9]?|[+-]?[1-9]\d*|[+-]?[1-9]\d*\.\d?[1-9]?)$/
                                        //     .test(e.target.value)
                                        // && this.props.appState.setOthProps('potentialInvestmentAmt', e.target.value)
                                    })
                            )
                        )
                    ),
                    h.div('', {},
                        h.div('erp-col-8 label-margin', {},
                            h.label('', {}, 'Pre-Money Valuation')
                        ),
                        h.div('erp-col-13', {},
                            h.div('erp-col-8', {},
                                h(Select, {
                                        onSelect: value => this.props.appState.setOthProps('pmvCurrencyCode', value),
                                        onChange: value => this.props.appState.setOthProps('pmvCurrencyCode', value),
                                        options: this.props.appState.currencyList,
                                        disabled: this.props.appState.disabled,
                                        value: this.props.appState.pmvCurrencyCode
                                    }
                                ),
                            ),
                            h.div('erp-col-14 money', {},
                                h(Text,
                                    this.props.appState.preMoneyValuation >= 0
                                        ? 'currencyText' : 'currencyText negative-value',
                                    {
                                        value: this.props.appState.preMoneyValuation,
                                        disabled: this.props.appState.disabled,
                                        // onBlur: this.pmvHandleBlur,
                                        onChange: e => {
                                            let value = e.target.value;
                                            let newValue = null;
                                            let rgxNumber = /^[+-]?\d{0,11}(\.\d{0,2})?$/;
                                            if (rgxNumber.test(value)) {
                                                newValue = value;
                                            }
                                            if (/^[+]$/.test(value)) {
                                                newValue = 0;
                                            }
                                            if (newValue !== null) {
                                                this.props.appState.setOthProps('preMoneyValuation', newValue);
                                            }
                                        }
                                        // onChange: e =>
                                        // /^([+-]?0|[+-]?|[+-]?0\.\d?[1-9]?|[+-]?[1-9]\d*|[+-]?[1-9]\d*\.\d?[1-9]?)$/
                                        //     .test(e.target.value)
                                        // && this.props.appState.setOthProps('preMoneyValuation', e.target.value)
                                    })
                            )
                        )
                    )
                ),
                h.div('line-thread', {}),
                h(Section, {column: 1},
                    this.getFormItemValidator()[4]
                ),
                h(Section, {column: 1},
                    formItemRenderer(this.getGroup7())
                ),
                h.div('line-thread', {}),
                h(Section, {column: 1},
                    formItemRenderer(this.getGroup8())
                ),
                h(Section, {column: 1, className: 'attachment-list', layoutType: 'normal'},
                    [this.getAttachmentList()]
                ),
                this.props.appState.buttonGroupShow ? h(Section, {column: 1, className: 'button-group'},
                        formItemRenderer(this.getButtonGroup())
                    ) : null,
                h(Modal, {
                        shouldShow: this.modalModel.shouldShowModal,
                        header: '附件上传',
                        onClose: this.closeModal,
                        className: 'project-manage',
                        size: 'xs',
                        footer: h(Section, {column: 1, className: 'button-group model-footer'},
                            formItemRenderer(this.getModalButton())
                        )
                    },
                    h.div('', {},
                        h(Section, 'modal-row', {column: 1},
                            formItemRenderer(this.getModalGroup())
                        )
                    )
                ),
                h(Modal, {
                        shouldShow: this.showMessageModal,
                        // header: '消息提示',
                        onClose: this.closeMessageModal,
                        size: 'xs'
                    },
                    h.div('', {},
                        h.div('', {}, '通过变为未通过,后续阶段信息将全部清空'),
                        h(Section, {column: 1, className: 'button-group'},
                            formItemRenderer(this.getMessageModal())
                        )
                    )
                )
            ),
        );
    }
}
