/**
 * @file 封装一下常用的方法
 * @author YaoKun
 */
import moment from 'moment';
import agent from 'utils/ajax-agent';
import {Message} from 'common/comps/default';

// 项目入库接口  value:value   data:appState || this.props.appState
export function loadDetailData(value, data) {
    // select把后端数据格式更改 并且加上请选择
    value.maBuList.unshift({name: '请选择', code: 'null'});
    value.sourceList.unshift({name: '请选择', code: 'null'});
    value.sourceList = value.sourceList.map(option => {
        return {
            text: option.name,
            code: option.code
        };
    });
    value.maBuList = value.maBuList.map(option => {
        return {
            text: option.name,
            code: option.code
        };
    });
    value.phaseStatusCodeToNames = value.phaseStatusCodeToNames.map(option => {
        return {
            text: option.name,
            code: option.code
        };
    });
    value.currencyList = value.currencyList.map(option => {
        return {
            text: option.currencyCode,
            code: option.currencyCode
        };
    });
    value.attachmentType = value.attachmentType.map(option => {
        return {
            text: option.name,
            code: option.code
        };
    });
    value.attachmentType.length && value.attachmentType.unshift({
        text: '请选择',
        code: ''
    });
    const newPhaseStatusCodeToNames = [];
    value.phaseStatusCodeToNames.map(it => {
        if (it.code === 'APPROVED' || it.code === 'REFUSE') {
            newPhaseStatusCodeToNames.push(it);
        }
        if (newPhaseStatusCodeToNames.length === 2) {
            return;
        }
    });
    newPhaseStatusCodeToNames.unshift({text: '请选择', code: ''});
    value.phaseStatusCodeToNames = newPhaseStatusCodeToNames;
    // 日期如果接口有传递 显示接口的日期 如果没有 显示当天日期  格式 'YYYY-MM-DD'
    const date = new Date();
    value.projectDate
        = moment(value.projectDate ? value.projectDate : date).format('YYYY-MM-DD');
    // 币种默认显示USD
    value.piCurrencyCode = value.piCurrencyCode ? value.piCurrencyCode : 'USD';
    value.pmvCurrencyCode = value.pmvCurrencyCode ? value.pmvCurrencyCode : 'USD';
    // MA负责人
    data.setProps('maLeaderName', value.maLeaderIdUIC ? value.maLeaderIdUIC.name : '');
    data.setProps('maLeaderDepart', value.maLeaderIdUIC ? value.maLeaderIdUIC.departmentName : '');
    // PMO负责人
    data.setProps('pmoLeaderName', value.pmoLeaderIdUIC ? value.pmoLeaderIdUIC.name : '');
    data.setProps('pmoLeaderDepart', value.pmoLeaderIdUIC ? value.pmoLeaderIdUIC.departmentName : '');
    // 项目发起人 如果没有值  默认显示当前登录用户
    if (value.projectSponsorId) {
        data.setProps('projectSponsorName', value.projectSponsorIdUIC ? value.projectSponsorIdUIC.name : '');
        data.setProps(
            'projectSponsorDepart', value.projectSponsorIdUIC ? value.projectSponsorIdUIC.departmentName : ''
        );
    }
    else {
        value.projectSponsorId = value.currentUser ? value.currentUser.username : '';
        data.setProps('projectSponsorName', value.currentUser ? value.currentUser.name : '');
        data.setProps('projectSponsorDepart', value.currentUser ? value.currentUser.departmentName : '');
    }
    // 将接口数据映射到页面中
    data.setValues(value);
    data.clearErrorkey();
    // 控制操作按钮是显示[提交,保存,下一步] 还是 [提交,取消]
    if (value.detailStatusCode === 'APPROVED' || value.detailStatusCode === 'REFUSE') {
        data.setProps('buttonShow', false);
    }
    else {
        data.setProps('buttonShow', true);
    }
    // 访问附件list查询接口
    const sourceType = value.phaseCodeToNames[0].code;
    if (data.projectId) {
        const detailAttach = {
            data: {
                sourceType: sourceType,
                sourceId: data.projectId
            }
        };
        agent.post('/attach/list', detailAttach)
            .then(result => {
                if (result.status === 'ok' && result.data) {
                    data.setProps('attachments', result.data);
                }
                else {
                    Message.error(result.message);
                }
            });
    }
}
// 项目初筛接口
export function loadStageData(value, data) {
    value.phaseStatusCodeToNames = value.phaseStatusCodeToNames.map(
        option => {
            return {
                text: option.name,
                code: option.code
            };
        });
    value.attachmentType = value.attachmentType.map(option => {
        return {
            text: option.name,
            code: option.code
        };
    });
    value.attachmentType.length && value.attachmentType.unshift({
        text: '请选择',
        code: ''
    });
    const newPhaseStatusCodeToNames = [];
    value.phaseStatusCodeToNames.map(it => {
        if (it.code === 'APPROVED' || it.code === 'REFUSE') {
            newPhaseStatusCodeToNames.push(it);
        }
        if (newPhaseStatusCodeToNames.length === 2) {
            return;
        }
    });
    newPhaseStatusCodeToNames.unshift({text: '请选择', code: ''});
    value.phaseStatusCodeToNames = newPhaseStatusCodeToNames;
    const date = new Date();
    value.startDate = moment(value.startDate
        ? value.startDate : date).format('YYYY-MM-DD');
    value.stageCode = value.phaseCodeToNames[1].code;
    data.setValues(value);
    data.clearErrorkey();
    // false  显示 提交 取消  getOthButtonGroup
    // true  显示 提交 保存 下一步 取消 getButtonGroup
    if (value.statusCode === 'APPROVED' || value.statusCode === 'REFUSE') {
        data.setProps('buttonShow', false);
    }
    else {
        data.setProps('buttonShow', true);
    }
    const sourceType = value.phaseCodeToNames[1].code;
    if (data.projectId) {
        const stageAttach = {
            data: {
                sourceType: sourceType,
                sourceId: data.projectId
            }
        };
        agent.post('/attach/list', stageAttach)
            .then(result => {
                if (result.status === 'ok' && result.data) {
                    data.setProps('attachments', result.data);
                }
                else {
                    Message.error(result.message);
                }
            });
    }
}
// 附件icon
export function iconFn(val) {
    let fileIcon = '';
    switch (val.toLowerCase()) {
        case 'excel':
        case 'xls':
        case 'xlsm':
        case 'xltm':
        case 'xltx':
        case 'xlsx':
            fileIcon = 'excel';
            break;
        case 'pdf':
            fileIcon = 'pdf';
            break;
        case 'jpg':
        case 'png':
        case 'psd':
        case 'gif':
        case 'image':
        case 'bmp':
        case 'jpeg':
            fileIcon = 'image';
            break;
        case 'ppt':
        case 'pptx':
            fileIcon = 'ppt';
            break;
        case 'doc':
        case 'docx':
        case 'word':
            fileIcon = 'word';
            break;
        case 'zip':
        case 'rar':
        case '7z':
            fileIcon = 'zip';
            break;
        case 'msg':
        case 'eml':
            fileIcon = 'msg';
            break;
        case 'html':
        case 'htm':
            fileIcon = 'html';
            break;
        case 'txt':
            fileIcon = 'txt';
            break;
        default:
            fileIcon = 'unknown';
            break;
    }
    return fileIcon;
}
