/**
 * @file  new project state
 * @author CaiYu
 */

import {observable, action, observe} from 'mobx';

export class AppState {
    /**
     * 业务模块代码
     * projectName : 项目名称
     * projectCode : 项目编号
     * companyName : 公司名称
     * commonName : 公司常用名
     * keyInfSummary : 关键信息摘要
     * projectSourceCode : 项目来源
     * buOwner : 所属BU
     * maLeaderId : M&A 负责人
     * pmoLeaderId : PMO 负责人
     * projectSponsorId : 项目发起人
     * projectDate : 项目入库时间
     * busiComments : 业务描述
     * dealRationale : deal rationale
     * potentialInvestmentAmt : Potential Investment Amoun
     * piCurrencyCode : Potential Investment Amoun 币种
     * preMoneyValuation : Pre Money Valuation
     * pmvCurrencyCode : Pre Money Valuation 币种
     * detailStatusCode : 项目入库状态
     * approveReason : 结论
     */
    @observable projectName = '';
    @observable projectCode;
    @observable companyName = '';
    @observable commonName = '';
    @observable keyInfSummary = '';
    @observable projectSourceCode = '';
    @observable buOwner;
    @observable maLeaderId = '';
    @observable maLeaderName = '';
    @observable maLeaderDepart = '';
    @observable pmoLeaderId = '';
    @observable pmoLeaderName = '';
    @observable pmoLeaderDepart = '';
    @observable busiComments = '';
    @observable dealRationale = '';
    @observable potentialInvestmentAmt;
    @observable preMoneyValuation;
    @observable detailStatusCode = '';
    @observable detailStatusCodeName = '';
    @observable approveReason = '';
    @observable projectDate;
    @observable projectSponsorId = '';
    @observable projectSponsorName = '';
    @observable projectSponsorDepart = '';
    @observable piCurrencyCode;
    @observable pmvCurrencyCode;
    @observable attachments = [];
    @observable buttonShow = true;
    @observable projectId;
    @observable stageCode = 'PROJECT_SUBMIT';
    @observable projectDetailId;
    @observable buttonGroupShow = true;
    @observable phaseCodeToNames;
    @observable showIndex = 0;
    @observable uploadDisabled = false;
    @observable downloadDisabled = false;
    @observable approveStatusCode;
    @observable approveStatusCodeName;
    @observable disabled = false;

    @action changeIndex(idx) {
        if (idx === undefined) {
            this.showIndex = this.showIndex + 1;
        }
        else {
            this.showIndex = idx;
        }
    }

    @observable errorKeys = {
        // commonName: false,
        projectName: false,
        keyInfSummary: false,
        projectSourceCode: false,
        buOwner: false,
        busiComments: false,
        approveStatusCode: false,
        projectDate: false
    }

    @action clearErrorkey() {
        Object.keys(this.errorKeys).map(it => {
            this.errorKeys[it] = false;
        });
    }

    @action changeOneErrorKey(key, value) {
        if (Object.keys(this.errorKeys).indexOf(key) >= 0) {
            this.errorKeys[key] = value;
        }
    }

    @observable requiredKeys = {
        projectName: true,
        buOwner: true,
        // commonName: true,
        busiComments: true,
        projectSourceCode: true,
        keyInfSummary: true,
        projectDate: true,
        approveStatusCode: true
    }

    @action setProps(name, value) {
        this[name] = value;
    }

    @action setOthProps(key, value) {
        this[key] = value;
    }

    @action removeAttachmentItem(item) {
        this.attachments.remove(item);
    }

    @action addAttachmentItem(item) {
        this.attachments.push(item);
    }

    @action setValues(obj) {
        for (let key of Object.keys(obj)) {
            this[key] = obj[key];
        }
    }
}

export class AppScreen {
    /**
     * 业务模块代码
     * participantId : 项目参与人员
     * startDate : 初筛时间
     * summaryComments : 摘要
     * refuseReason : 拒绝原因
     */
    @observable projectId;
    @observable participantId;
    @observable startDate;
    @observable summaryComments;
    @observable refuseReason;
    @observable shouldShowModal = false;
    @observable attachments = [];
    @observable buttonShow = true;
    @observable statusCode;
    @observable statusCodeName;
    @observable stageCode = 'PROJECT_SCREEN';
    @observable buttonGroupShow = true;
    @observable phaseCodeToNames;
    @observable participants = [];
    @observable approveStatusCode;
    @observable approveStatusCodeName;
    @observable disabled = false;

    @observable errorKeys = {
        startDate: false,
        summaryComments: false,
        approveStatusCode: false
    }

    @action clearErrorkey() {
        Object.keys(this.errorKeys).map(it => {
            this.errorKeys[it] = false;
        });
    }

    @observable requiredKeys = {
        startDate: true,
        summaryComments: true,
        approveStatusCode: true
    }

    @action setProps(name, value) {
        this[name] = value;
    }

    @action setOthProps(key, value) {
        this[key] = value;
    }

    @action setValues(obj) {
        for (let key of Object.keys(obj)) {
            this[key] = obj[key];
        }
    }

    @action removeAttachmentItem(item) {
        this.attachments.remove(item);
    }

    @action addAttachmentItem(item) {
        this.attachments.push(item);
    }
}

export class ModalModel {
    @observable attachmentDate;
    @observable attachmentTypeCode;
    @observable attachmentComments = '';
    @observable shouldShowModal = false;
    @observable isSubmit = false;

    @action setProps(name, value) {
        this[name] = value;
    }

    @action setOthProps(key, value) {
        this[key] = value;
    }

    @action setValues(obj) {
        for (let key of Object.keys(obj)) {
            this[key] = obj[key];
        }
    }

    @action clear() {
        this.attachmentDate = undefined;
        this.attachmentTypeCode = undefined;
        this.attachmentComments = '';
        this.isSubmit = false;
    }

    toJS() {
        return {
            attachmentDate: this.attachmentDate,
            sourceId: this.attachmentTypeCode,
            attachmentComments: this.attachmentComments
        };
    }
}

export class UploadErrorState {
    @observable showUploadErrorModal = false;
    @observable content1 = '';
    @observable content2 = '';

    @action setProps(name, value) {
        this[name] = value;
    }

    @action init() {
        this.showUploadErrorModal = false;
        this.content1 = '';
        this.content2 = '';
    }
}

