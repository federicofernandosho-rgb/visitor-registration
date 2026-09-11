param(
  [string]$ServiceName = "VisitorRegistration"
)

Stop-Service -Name $ServiceName
Get-Service -Name $ServiceName
