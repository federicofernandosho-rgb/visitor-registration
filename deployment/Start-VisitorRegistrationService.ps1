param(
  [string]$ServiceName = "VisitorRegistration"
)

Start-Service -Name $ServiceName
Get-Service -Name $ServiceName
