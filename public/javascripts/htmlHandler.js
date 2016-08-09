
function insertHtml(){

    var modelsArr = "<%= models%>";

    for (model in  modelsArr)
    {
        var htmlStr = '<li>
        <a href="#systemSetting" class="nav-header collapsed" data-toggle="collapse" data-parent="#main-nav">
            <i class="glyphicon glyphicon-cog"></i>' + 
            model.attributes[0].value + 
            '<span class="pull-right glyphicon glyphicon-chevron-toggle"></span>
        </a>

        </li> '

        main-nav.innerHTML = htmlStr;
    }
}