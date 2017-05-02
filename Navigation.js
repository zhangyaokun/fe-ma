/**
 * @file navigation
 * @author yaokun
 */

import {Component, observer, inject, h, c} from 'utils/erp';
@inject(['app']) @observer

export default class Navigation extends Component {

    constructor(props) {
        super(props);
        this.scrollNavigation = this.scrollNavigation.bind(this);
    }

    componentWillMount() {
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.scrollNavigation);
    }

    componentDidMount() {
        document.addEventListener('scroll', this.scrollNavigation);
    }

    componentWillReceiveProps() {
    }

    scrollNavigation() {
        const scrollY = window.scrollY;
        this.refs.navigation.style.top = scrollY + 'px';
    }

    // goTo(item) {
    //     const target = document.getElementById(item.id);
    //     if (target) {
    //         const y = window.scrollY + target.getBoundingClientRect().top;
    //         window.scrollTo(0, y);
    //     }
    // }

    render() {
        const {
            scrollWindow,
            showIndex,
            phaseCodeToNames
        } = this.props;
        const config = [
            {
                title: '项目入库'
                // id: 'storage'
            },
            {
                title: '项目初筛'
                // id: 'screening'
            },
            {
                title: '项目立项',
                id: ''
            },
            {
                title: '项目执行TS',
                id: ''
            },
            {
                title: '项目执行SPA',
                id: ''
            },
            {
                title: '项目交割',
                id: ''
            },
            {
                title: '项目小结',
                id: ''
            }];
        return h.div('navigation', {ref: 'navigation'},
            h.ul('', {},
                config.map((item, idx) => h.li('', {
                        key: idx,
                        onClick: e => idx === showIndex
                            ? scrollWindow(phaseCodeToNames[showIndex].code) : scrollWindow(phaseCodeToNames[idx].code)
                    },
                    h.span(c('cycle', {'out-cycle': idx <= showIndex})),
                    h.span(c('title', {finished: idx <= showIndex}), {}, item.title),
                    idx === config.length - 1 ? null : h.span(c('line', {finished: idx <= showIndex})),
                ))
            )
        );
    }
}
