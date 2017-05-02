/**
 * @file Screening 项目初筛
 * @author yaokun
 */
import agent from 'utils/ajax-agent';
import {observable, action, toJS} from 'mobx';
import {Component, observer, inject, h, consts, c} from 'utils/erp';
import {Section, Panel, formItemRenderer, Modal, Button, Message, formItemValidator} from 'common/comps/default';
import {ModalModel} from './app-state';
import style from './page-style.use.less';
import fileStyle from '@befe/erp-comps/complex/WrapperUpload/component.use.less';
import moment from 'moment';
import urlUtils from 'utils/url-utils';
import {loadStageData, iconFn} from './Utils';
import {highlight} from '@befe/utils/lib/highlight-tips';
const modalModel = new ModalModel();

@inject(['app']) @observer
export default class Information extends Component {
    constructor(props) {
        super(props);
        this.modalModel = modalModel;
        this.ScrOnSubmit = this.ScrOnSubmit.bind(this);
        this.ScrOnSave = this.ScrOnSave.bind(this);
        this.submitModal = this.submitModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.othScrOnCancel = this.othScrOnCancel.bind(this);
        this.othScrOnSubmit = this.othScrOnSubmit.bind(this);
        this.statusCodeChange = this.statusCodeChange.bind(this);
    }

    @observable inlineHasError = false;

    @action changeError(val = false) {
        this.inlineHasError = val;
    }

    @observable submitClick = false;
    @observable othSubmitClick = false;
    @observable saveClick = false;
    @observable attBtnClick = false;
    @observable attamentTips = true;

    @action setProps(key, val) {
        this[key] = val;
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

    componentWillReceiveProps() {
    }

    handleSuggestSelected(item) {
        this.props.appScreen.setProps('participants', item);
        let participantId = item.username;
        this.props.appScreen.setProps('participantId', participantId);
        this.changeError();
    }

    getGroup1() {
        const configs = [
            {
                key: 'startDate',
                type: 'calendar',
                leftColWidth: 4,
                rightColWidth: 8,
                className: 'require startDate',
                disabled: this.props.appScreen.disabled,
                title: '项目初筛时间'
            }
        ];
        return {
            stateObj: this.props.appScreen,
            configs
        };
    }

    getInputVal(name, id, depart) {
        let val = name || '';
        if (id && depart) {
            val += '(' + id + ',' + depart + ')';
        }
        else if (id || depart) {
            let val2 = id || depart;
            val += val ? '(' + val2 + ')' : val2;
        }
        return val;
    }

    getGroup2() {
        const configs = [
            {
                key: 'participantId',
                type: 'multiple-user-suggest',
                leftColWidth: 4,
                rightColWidth: 18,
                title: '参与人员',
                inputParamName: 'inputVal',
                layoutType: 'inline',
                className: 'require participantId',
                defaultValue: '',
                value: this.props.appScreen.participantId,
                sugUrl: '/suggest/user',
                disabled: this.props.appScreen.disabled,
                valueLabels: this.props.appScreen.participants || [],
                placeholder: '请输入',
                inputValue: this.props.appScreen.participantId,
                optionLabel: item => this.getInputVal(item.name, item.username, item.departmentName),
                renderItem: (item, val) => {
                    item = this.getInputVal(item.name, item.username, item.departmentName) || '';
                    return highlight(item, val || '', 'erp-highlight-tips');
                },
                style: {},
                onSelected: item => this.handleSuggestSelected(item),
                hasError: this.inlineHasError
            }
        ];
        return {
            stateObj: this.props.appScreen,
            configs
        };
    }

    getGroup3() {
        const configs = [
            {
                key: 'summaryComments',
                type: 'textarea',
                leftColWidth: 4,
                rightColWidth: 18,
                className: 'require summaryComments',
                disabled: this.props.appScreen.disabled,
                maxCount: 200,
                title: '关键信息摘要'
            }
        ];
        return {
            stateObj: this.props.appScreen,
            configs
        };
    }

    getGroup4() {
        const configs = [
            {
                key: 'approveStatusCode',
                type: 'select',
                leftColWidth: 4,
                rightColWidth: 2,
                disabled: this.props.appScreen.disabled,
                title: '结论',
                className: 'require approveStatusCode',
                onSelect: item => this.statusCodeChange(item),
                options: this.props.appScreen.phaseStatusCodeToNames
            }
        ];
        return {
            stateObj: this.props.appScreen,
            configs
        };
    }

    statusCodeChange(item) {
        this.props.appScreen.setProps('approveStatusCode', this.props.appScreen.phaseStatusCodeToNames[item].code);
        this.props.appScreen.setProps('approveStatusCodeName', this.props.appScreen.phaseStatusCodeToNames[item].text);
    }

    getGroup5() {
        const configs = [
            {
                key: 'refuseReason',
                type: 'textarea',
                leftColWidth: 4,
                rightColWidth: 18,
                className: 'refuseReason',
                disabled: this.props.appScreen.disabled,
                maxCount: 200,
                title: '通过/未通过原因'
            }
        ];
        return {
            stateObj: this.props.appScreen,
            configs
        };
    }

    getGroup6() {
        const app = this.props.app;
        const configs = [
            {
                type: 'button',
                title: '附件',
                leftColWidth: 4,
                label: '上传附件',
                iconType: 'attachAdd',
                className: 'button-attachment',
                disabled: this.props.appScreen.disabled,
                // btnType: 'ghost',
                size: 'sm',
                shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_UPLOADATTACHMENT),
                onClick: this.openModal
            }
        ];
        return {
            stateObj: this.props.appScreen,
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
                options: this.props.appScreen.attachmentType
            },
            {
                key: 'attachmentComments',
                type: 'textarea',
                leftColWidth: 6,
                rightColWidth: 16,
                maxCount: 200,
                title: '摘要',
                className: 'attachmentComments'
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
                maxSize: 10240,
                tips: this.attamentTips ? '提示：单个附件大小 <= 10M' : '',
                isSubmit: this.modalModel.isSubmit,
                onUploadChange: res => this.onUploadChange(res),
                url: '/attach/upload',
                params: [
                    {
                        name: 'sourceType',
                        value: this.props.appScreen.phaseCodeToNames
                            ? this.props.appScreen.phaseCodeToNames[1].code : ''
                    },
                    {name: 'sourceId', value: this.props.appScreen.projectId || ''},
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

    modalSubmitSuccess(res) {
        Message.done('上传成功');
        this.props.appScreen.addAttachmentItem(res.data);
        this.modalModel.setProps('isSubmit', false);
        this.closeModal();
        this.setProps('attBtnClick', true);
    }

    modalSubmitError(res) {
        Message.error(res.data.map(it => it.defaultMessage).join(','));
        this.modalModel.setProps('isSubmit', false);
        this.setProps('attBtnClick', false);
        console.log(res);
    }

    submitModal() {
        this.setProps('attBtnClick', true);
        this.modalModel.setProps('isSubmit', true);
    }

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
            stateObj: this.props.appScreen,
            configs
        };
    }

    openModal() {
        const date = new Date();
        this.setProps('attBtnClick', true);
        this.setProps('attamentTips', true);
        this.modalModel.setProps('attachmentDate', moment(date).format('YYYY-MM-DD'));
        this.modalModel.setProps('shouldShowModal', true);
    }

    closeModal() {
        this.modalModel.setProps('shouldShowModal', false);
        this.setProps('attBtnClick', false);
        this.modalModel.clear();
    }

    // 操作按钮
    getScreenButtonGroup() {
        const app = this.props.app;
        const buttonConfigs = [
            {
                type: 'button-group',
                title: ' ',
                // leftColWidth: 4,
                options: [
                    {
                        label: '提交',
                        btnType: 'primary',
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_CONFIRM),
                        onClick: this.ScrOnSubmit,
                        disabled: this.submitClick
                    },
                    {
                        label: '暂存',
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_SAVE),
                        onClick: this.ScrOnSave,
                        disabled: this.saveClick
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
                        btnType: 'primary',
                        shouldHide: app.shouldHide(consts.PERMISSION_ELEMENTS.MA_FUNC_PJM_CONFIRM),
                        onClick: this.othScrOnSubmit,
                        disabled: this.othSubmitClick
                    },
                    {
                        label: '取消',
                        onClick: this.othScrOnCancel
                    }
                ]
            }
        ];
        const configs = this.props.appScreen.buttonShow ? buttonConfigs : othButtonConfigs;
        return {
            stateObj: this.props.appScreen,
            configs
        };
    }

    // 提交
    @action ScrOnSubmit() {
        this.setProps('submitClick', true);
        const {
            appScreen: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        if (param.data.participants <= 0) {
            this.changeError(true);
            this.setProps('submitClick', false);
            return;
        }
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        // this.props.appScreen.clearErrorkey();
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_stage/submit_stage', param)
                .then(result => {
                    if (result.status === 'ok' && result.data) {
                        loadStageData(result.data, this.props.appScreen);
                        urlUtils.jump('detail/' + result.data.projectId);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appScreen.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data.map(it => it.defaultMessage).join(','));
                    }
                    this.setProps('submitClick', false);
                });
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('submitClick', false);
        }
    }

    // 从编辑页面进入后的提交
    othScrOnSubmit() {
        this.setProps('othSubmitClick', true);
        const {
            appScreen: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        if (param.data.participants <= 0) {
            this.changeError(true);
            this.setProps('othSubmitClick', false);
            return;
        }
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        // this.props.appScreen.clearErrorkey();
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_stage/submit_stage', param)
                .then(result => {
                    if (result.status === 'ok' && result.data) {
                        loadStageData(result.data, this.props.appScreen);
                        urlUtils.jump('detail/' + result.data.projectId);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appScreen.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data.map(it => it.defaultMessage).join(','));
                    }
                    this.setProps('othSubmitClick', false);
                });
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('othSubmitClick', false);
        }
    }

    // 暂存
    ScrOnSave() {
        this.setProps('saveClick', true);
        const {
            appScreen: data,
            group
        } = this.props;
        let param = {data: toJS(data)};
        if (param.data.participants <= 0) {
            this.changeError(true);
            this.setProps('saveClick', false);
            return;
        }
        param.data.attachments = param.data.attachments.map(it => it.attachmentId);
        // this.props.appScreen.clearErrorkey();
        if (formItemValidator.validator()) {
            agent.post('/ivt/project/edit_stage/save_stage', param)
                .then(action(result => {
                    if (result.status === 'ok' && result.data) {
                        Message.done('暂存成功');
                        loadStageData(result.data, this.props.appScreen);
                    }
                    else if (result.status === 'error.project.status') {
                        Message.error('项目状态已中止，请返回详情页重新查询，正在为您跳转...');
                        setTimeout(() => {
                            urlUtils.jump('detail/' + this.props.appScreen.projectId);
                        }, 1000);
                    }
                    else {
                        Message.error(result.data.map(it => it.defaultMessage).join(','));
                    }
                    this.setProps('saveClick', false);
                }));
        }
        else {
            Message.error('您有必填项未填写');
            this.setProps('saveClick', false);
        }
    }

    // 取消
    othScrOnCancel() {
        urlUtils.jump('detail/' + this.props.appScreen.projectId);
    }

    getAttachmentList() {
        const lists = this.props.appScreen.attachments || [];
        return h.div('', {key: '1'},
            h.div('erp-col-4'),
            h.div('erp-col-18 upload', {},
                lists.map((item, idx) => {
                    let fileIcon = iconFn(item.attachmentName.split('.')[1]);
                    const iconClass = `file-type file-type-${fileIcon} file-name`;
                    const className = this.props.appScreen.disabled ? 'attach-item-disabled' : 'attach-item-file';
                    return h.span('attach-item', {key: idx},
                        h.span(iconClass, {}),
                        h.span(className, {title: '附件类型:' + item.attachmentTypeCodeName}, item.attachmentName),
                        this.props.appScreen.disabled ? null : h.i('erp-icon erp-icon-remove remove',
                                {
                                    onClick: () => this.deleteAttachment(item)
                                })
                    );
                })
            )
        );
    }

    deleteAttachment(item) {
        const url = '/attach/remove/' + item.attachmentId;
        agent.get(url)
            .then(action(result => {
                if (result.status === 'ok') {
                    Message.done('删除成功');
                    this.props.appScreen.removeAttachmentItem(item);
                }
            }));
    }

    getFormItemValidator() {
        const getGroup1 = this.getGroup1().configs;
        const getGroup3 = this.getGroup3().configs;
        const getGroup4 = this.getGroup4().configs;
        let formItems = [];
        formItemValidator.setStateObj(this.props.appScreen, {
            requiredKeys: this.props.appScreen.requiredKeys,
            errorKeys: this.props.appScreen.errorKeys
        });
        formItems.push(formItemValidator.renderer(getGroup1));
        formItems.push(formItemValidator.renderer(getGroup3));
        formItems.push(formItemValidator.renderer(getGroup4));
        return formItems;
    }

    render() {
        const status = this.props.appScreen.statusCodeName ? this.props.appScreen.statusCodeName : '未开始';
        const panelParams = {
            title: '2/7项目初筛',
            className: this.props.hasActive ? 'active-workspace not-before' : 'not-before'
        };
        return h.div({id: 'screening'},
            h(Panel, panelParams,
                h.span('', {
                    className: status === '已通过' ? 'title-sucStatus'
                        : status === '进行中' ? 'title-inStatus'
                            : status === '未通过' ? 'title-ovStatus' : 'title-status'
                }, status),
                h(Section, {column: 1},
                    this.getFormItemValidator()[0]
                ),
                h(Section, {column: 1},
                    formItemRenderer(this.getGroup2())
                ),
                h(Section, {column: 1},
                    this.getFormItemValidator()[1]
                ),
                h(Section, {column: 1},
                    this.getFormItemValidator()[2]
                ),
                h(Section, {column: 1},
                    formItemRenderer(this.getGroup5())
                ),
                h(Section, {column: 1},
                    formItemRenderer(this.getGroup6())
                ),
                h(Section, {column: 1, className: 'attachment-list', layoutType: 'normal'},
                    [this.getAttachmentList()]
                ),
                this.props.appScreen.buttonGroupShow ? h(Section, {column: 1, className: 'button-group'},
                        formItemRenderer(this.getScreenButtonGroup())
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
                )
            ),
        );
    }
}
