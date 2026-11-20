param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot)
$port = 18766
$url = "http://127.0.0.1:$port/social-workspace.html"
$listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $port)
$mime = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css'; '.js'='application/javascript'; '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.gif'='image/gif'; '.mp4'='video/mp4'; '.webm'='video/webm'; '.pdf'='application/pdf'; '.csv'='text/csv'; '.xlsx'='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; '.woff2'='font/woff2'; '.woff'='font/woff'; '.zip'='application/zip' }
try { $listener.Start() } catch { Write-Host "Port $port is in use. Close the other package launcher, then try again."; Read-Host 'Press Enter to close'; exit 1 }
Write-Host "JML Social Content OS: $url"
Write-Host 'Keep this window open. Press Ctrl+C to stop. Files stay on this computer.'
if (-not $NoBrowser) { Start-Process $url }
try {
 while ($true) {
  $client = $listener.AcceptTcpClient()
  $client.ReceiveTimeout = 5000
  $client.SendTimeout = 30000
  try {
   $stream = $client.GetStream()
   $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
   $request = $reader.ReadLine()
   if (-not $request) { continue }
   $parts = $request.Split(' ')
   $headers = @{}
   while ($line = $reader.ReadLine()) { $split = $line.IndexOf(':'); if ($split -gt 0) { $headers[$line.Substring(0,$split).ToLower()] = $line.Substring($split+1).Trim() } }
   $status = '200 OK'; $body = $null; $file = $null; $offset = [long]0; $length = [long]0; $extra = ''
   $route = [Uri]::UnescapeDataString(($parts[1] -split '\?')[0]).Replace('/',[IO.Path]::DirectorySeparatorChar).TrimStart([IO.Path]::DirectorySeparatorChar)
   if (-not $route) { $route = 'social-workspace.html' }
   $target = [IO.Path]::GetFullPath([IO.Path]::Combine($root,$route))
   if ($parts[0] -notin @('GET','HEAD')) { $status='405 Method Not Allowed'; $body=[Text.Encoding]::UTF8.GetBytes('GET and HEAD only.') }
   elseif (-not $target.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -or $route -match '(^|[\\/])\.' -or -not [IO.File]::Exists($target)) { $status='404 Not Found'; $body=[Text.Encoding]::UTF8.GetBytes('File not found.') }
   else {
    $file = [IO.File]::OpenRead($target); $length=$file.Length
    if ($headers['range'] -match '^bytes=(\d+)-(\d*)$') {
     $offset=[long]$Matches[1]; $end=$length-1
     if ($Matches[2]) { $end=[Math]::Min($end,[long]$Matches[2]) }
     if ($offset -gt $end) { $status='416 Range Not Satisfiable'; $extra="Content-Range: bytes */$length`r`n"; $length=0 }
     else { $status='206 Partial Content'; $extra="Content-Range: bytes $offset-$end/$length`r`n"; $length=$end-$offset+1; [void]$file.Seek($offset,[IO.SeekOrigin]::Begin) }
    }
   }
   $type = $mime[[IO.Path]::GetExtension($target).ToLower()]; if (-not $type) { $type='application/octet-stream' }
   if ($null -ne $body) { $length=$body.Length; $type='text/plain; charset=utf-8' }
   $response = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $length`r`nAccept-Ranges: bytes`r`nCache-Control: no-cache`r`nConnection: close`r`n${extra}`r`n"
   $bytes=[Text.Encoding]::ASCII.GetBytes($response); $stream.Write($bytes,0,$bytes.Length)
   if ($parts[0] -ne 'HEAD') {
    if ($null -ne $body) { $stream.Write($body,0,$body.Length) }
    elseif ($file -and $length -gt 0) { $buffer=New-Object byte[] 65536; $remaining=$length; while ($remaining -gt 0) { $count=$file.Read($buffer,0,[int][Math]::Min($buffer.Length,$remaining)); if ($count -eq 0) { break }; $stream.Write($buffer,0,$count); $remaining-=$count } }
   }
  } catch { Write-Verbose $_ } finally { if ($file) { $file.Dispose(); $file=$null }; $client.Dispose() }
 }
} finally { $listener.Stop() }
