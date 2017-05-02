/**
 * @file ProjectManege 入口
 * @author CaiYu
 */
import {Component, observer, inject, h} from 'utils/erp';
import {observable, action, computed, toJS} from 'mobx';
import {Message} from 'common/comps/default';
import WrapperBreadcrumb from 'utils/WrapperBreadcrumb';
import Information from './Information';
import ProjectStorage from './ProjectStorage';
import Navigation from './Navigation';
import Screening from './Screening';
import style from './page-style.use.less';
import agent from 'utils/ajax-agent';
import {AppState, AppScreen} from './app-state';
import ReactDOM from 'react-dom';
import {loadDetailData, loadStageData} from './Utils';
import urlUtils from 'utils/url-utils';
const appState = new AppState();
const appScreen = new AppScreen();

@inject(['app']) @observer
export default class extends Component {
    @observable id = null;
    @observable phaseCodeToNames = [];

    @action initPhaseCode(item = []) {
        this.phaseCodeToNames = item;
    }

    @observable projectId;
    @observable stageCode;
    @observable phaseStatusCode;

    @action setProps(name, value) {
        this[name] = value;
    }

    constructor(props) {
        super(props);
        this.appState = appState;
        this.appScreen = appScreen;
        this._scrollWindow = this._scrollWindow.bind(this);
        this.buttonControl = this.buttonControl.bind(this);
        this.setProps('projectId', props.location.query.projectId || '');
        this.setProps('stageCode', props.location.query.stageCode || '');
        this.setProps('phaseStatusCode', props.location.query.phaseStatusCode || '');
    }

    componentWillMount() {
        style.use();
        const data = {
            projectId: this.projectId,
            stageCode: this.stageCode
        }
        this.buttonControl();
        let params = this.projectId ? {data: toJS(data)} : {};
        // 入库的接口
        agent.post('/ivt/project/edit_detail/load_detail', params)
            .then(result => {
                if (result.status === 'ok' && result.data) {
                    loadDetailData(result.data, appState);
                    // 控制导航
                    this.initPhaseCode(result.data.phaseCodeToNames);
                    let index = result.data.phaseCodeToNames.findIndex(it => it.code === data.stageCode);
                    if (this.phaseStatusCode && this.phaseStatusCode === 'APPROVED') {
                        appState.changeIndex(index + 1);
                        const stageCode = result.data.phaseCodeToNames[1].code;
                        setTimeout(() => {
                            this._scrollWindow(stageCode);
                        }, 1);
                    }
                    else if (this.stageCode && this.stageCode !== 'PROJECT_SUBMIT') {
                        appState.changeIndex(index);
                        const stageCode = result.data.phaseCodeToNames[1].code;
                        setTimeout(() => {
                            this._scrollWindow(stageCode);
                        }, 1);
                    }
                    else {
                        appState.changeIndex(index < 0 ? 0 : index);
                        const stageCode = result.data.phaseCodeToNames[0].code;
                        setTimeout(() => {
                            this._scrollWindow(stageCode);
                        }, 1);
                    }
                }
                else if (result.status === 'error.no.permission') {
                    urlUtils.jump('403', {}, 'error');
                }
                else {
                    Message.error(result.message);
                }
            });
        if (this.stageCode && this.stageCode !== 'PROJECT_SUBMIT'
            || this.stageCode === 'PROJECT_SUBMIT' && this.phaseStatusCode === 'APPROVED') {
            const secData = {
                projectId: this.projectId,
                stageCode: this.stageCode
            };
            let secParams = {data: toJS(secData)};
            // 初筛的接口
            agent.post('/ivt/project/edit_stage/load_stage', secParams)
                .then(result => {
                    if (result.status === 'ok' && result.data) {
                        loadStageData(result.data, appScreen);
                        if (this.stageCode === appScreen.stageCode
                            && this.phaseStatusCode && this.phaseStatusCode === 'APPROVED') {
                            let index = result.data.phaseCodeToNames.findIndex(it => it.code === data.stageCode);
                            appState.changeIndex(index + 1);
                        }
                        const stageCode = result.data.phaseCodeToNames[1].code;
                        setTimeout(() => {
                            this._scrollWindow(stageCode);
                        }, 500);
                    }
                    else if (result.status === 'error.no.permission') {
                        urlUtils.jump('403', {}, 'error');
                    }
                    else {
                        Message.error(result.message);
                    }
                });
        }
    }

    componentWillUnmount() {
        style.unuse();
    }

    componentDidMount() {
    }

    componentWillReceiveProps() {
    }

    _scrollWindow(ref) {
        let currentNode = ReactDOM.findDOMNode(this.refs[ref]);
        currentNode && window.scrollTo(0, window.scrollY + currentNode.getBoundingClientRect().top);
    }

    buttonControl() {
        appState.setProps('buttonGroupShow', true);
        appState.setProps('uploadDisabled', false);
        appState.setProps('downloadDisabled', false);
        appScreen.setProps('buttonGroupShow', true);
        appState.setProps('disabled', false);
        appScreen.setProps('disabled', false);
        if (this.stageCode && this.stageCode === 'PROJECT_SUBMIT') {
            if (this.phaseStatusCode && this.phaseStatusCode !== 'APPROVED' || !this.phaseStatusCode) {
                appState.setProps('buttonGroupShow', true);
                appState.setProps('uploadDisabled', false);
                appState.setProps('downloadDisabled', false);
                appState.setProps('disabled', false);
            }
            else {
                appState.setProps('buttonGroupShow', false);
                appState.setProps('uploadDisabled', true);
                appState.setProps('downloadDisabled', true);
                appScreen.setProps('buttonGroupShow', true);
                appState.setProps('disabled', true);
            }
        }
        // 第二阶段的code  不显示第一阶段的button
        else if (this.stageCode && this.stageCode !== 'PROJECT_SUBMIT' || this.stageCode === 'PROJECT_SCREEN') {
            appState.setProps('buttonGroupShow', false);
            appState.setProps('uploadDisabled', true);
            appState.setProps('downloadDisabled', true);
            appState.setProps('disabled', true);
            // 如果状态是未通过
            if (this.phaseStatusCode && this.phaseStatusCode !== 'APPROVED' || !this.phaseStatusCode) {
                appScreen.setProps('buttonGroupShow', true);
                appScreen.setProps('disabled', false);
            }
            else {
                appScreen.setProps('buttonGroupShow', false);
                appScreen.setProps('disabled', true);
            }
        }
        else if (this.stageCode && this.stageCode !== 'PROJECT_SUBMIT' && this.phaseStatusCode === 'APPROVED') {
            appScreen.setProps('buttonGroupShow', true);
            appScreen.setProps('disabled', true);
        }
        else {
            appScreen.setProps('disabled', false);
            appState.setProps('buttonGroupShow', true);
            appScreen.setProps('buttonGroupShow', true);
        }
    }

    breadcrumbConfig() {
        return [
            {
                type: 'home',
                path: 'index'
            },
            {
                text: '项目列表',
                path: 'index'
            },
            {
                text: '项目管理'
            }
        ];
    }

    render() {
        const phaseCodeToNames = this.phaseCodeToNames;
        const config = this.breadcrumbConfig();
        return h.div('project-manage', {},
            h.div('erp-row', {},
                h.div('sidebar', {},
                    h(Navigation,
                        {phaseCodeToNames, scrollWindow: this._scrollWindow, showIndex: appState.showIndex})
                ),
                h.div('content', {},
                    h(WrapperBreadcrumb, {config}),
                    h.div('workspace', {},
                        h(Information, {
                            appState, isActive: appState.showIndex === 0,
                            ref: phaseCodeToNames.length ? phaseCodeToNames[0].code : ''
                        }),
                        h(ProjectStorage,
                            {
                                appState,
                                appScreen,
                                hasActive: appState.showIndex === 0,
                                changeWindow: this._scrollWindow
                            }),
                        appState.showIndex >= 1
                            ? h.div('', {ref: phaseCodeToNames.length ? phaseCodeToNames[1].code : ''},
                                h(Screening, {
                                    appScreen,
                                    hasActive: appState.showIndex === 1,
                                    ref: phaseCodeToNames.length ? phaseCodeToNames[1].code : '',
                                    phaseCodeToNames: phaseCodeToNames
                                })
                            )
                            : null,
                        h.div('shadow-workspace', {})
                    )
                ),
            )
        );
    }
}
