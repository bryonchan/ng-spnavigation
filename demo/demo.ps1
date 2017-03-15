$spHost = ''
$spWebServerRelativeUrl = '';

$spWebUrl = "$spHost$spWebServerRelativeUrl"

# Store path of this file for later use
$invocation = (Get-Variable MyInvocation).Value
$directorypath = Split-Path $invocation.MyCommand.Path

Connect-SPOnline -Url ($spWebUrl)
Write-Output ('Connecting to '+$spWebUrl)

$pageName = 'ng-spnavigation'
$pageTitle = $pageName + ' Demo'
$pageTemplateName = 'BlankWebPartPage'

$page = Get-SPOListItem -List Pages -Query ("<View><Query><Where><Eq><FieldRef Name='LinkFilename'/><Value Type='Text'>"+$pageName+".aspx</Value></Eq></Where></Query></View>")
if($page.Count -gt 0){
    Write-Output ($pageTitle+" already exists")
}else{
    Write-Output ("Creating "+$pageTitle+" in "+$spWebUrl)
    Add-SPOPublishingPage -PageName $pageName -Title $pageTitle -PageTemplateName $pageTemplateName
    $page = Get-SPOListItem -List Pages -Query ("<View><Query><Where><Eq><FieldRef Name='LinkFilename'/><Value Type='Text'>"+$pageName+".aspx</Value></Eq></Where></Query></View>")

}

$pageUrl = ($spWebServerRelativeUrl+'/Pages/'+$pageName+'.aspx')
Write-Output ('Demo Page: '+ $spWebUrl+'/Pages/'+$pageName+'.aspx')
Set-SPOFileCheckedOut -Url $pageUrl

Remove-SPOWebPart -ServerRelativePageUrl $pageUrl -Title 'Script Editor'

$webpart = Get-Content ($directorypath+'\demo.xml')
Add-SPOWebPartToWebPartPage -ServerRelativePageUrl $pageUrl -XML "$webpart" -ZoneId "Header" -ZoneIndex 1 

Disconnect-SPOnline