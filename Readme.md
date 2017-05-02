# FE-MA项目的总结

### 项目采用react和mobx的框架
	- 此页面为表单提交
	- 总共六个阶段 
	- 目前只是第一阶段和第二阶段
	- 当第一阶段点击提交后  进入第二阶段

### 搭建步骤:
	- 最外层的index搭配路由
	- NewPage 内部搭建
		- 主要由index 进行初始化操作
		- urtils   封装了一些公用方法
		- app-state 对初始化接口的字段进行初始值赋值/对初始定义的状态赋值/操作数据的方法
		- 以及各个组件的js组件搭建
		
### index.js
	componentWillMount  => 
		内定义初始化init时候访问的接口以及赋值操作
	constructor  =>   
		定义初始化的时候要执行的操作事件 切记要bind下 
	 	[demo] = [this.buttonControl = this.buttonControl.bind(this)]
	render		=> 渲染
		Navigation.js 			页面导航栏  
		WrapperBreadrumb.js  	组件header 
		Information.js 			基本信息  
		ProjectStroage.js  		入库阶段  
		Screening.js       		初筛阶段  
	review的难点 =>
		对于当前的执行状态是否有值以及值来判断是否显示入库页面以外的页面，
		包括操作按钮的控制以及是否置灰
		demo =>	
			this.buttonControl();
### app-state.js
	定义页面初始数据的值	=>
		@observable projectId = '';
	定义页面对初始数据要进行操作或者赋值	=>
		@action setProps(key,val){
			this.[key] = val;
		}
	以及初始数据外需要自定义参数的值,类似按钮disabled属性为true还是false
	
### Navigation.js
	review难点	=>
		左侧导航进行到第几阶段哪个阶段的颜色高亮,并且点击会跳转至所点击的阶段的页面

### Information.js ProjectStroge.js Screening.js
***review难点***

	整体布局采用section组件,还有formItemRenderer
	校验采用formItemValidator组件
	modal组件
	针对组件的操作方法
	按钮操作方法
	getInformationConfigs() {
        const configs = [
            {
                key: 'projectName',
                type: 'text',
                className: 'require',
                title: '项目名称',
                disabled: this.props.appState.disabled
            },
            {
                key: 'projectCode',
                type: 'text',
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
   
    
