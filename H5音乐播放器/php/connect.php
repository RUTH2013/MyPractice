<?PHP
	
	header("Content-type: text/html; charset=utf-8");
	$con = mysql_connect('localhost','root',''); // 连接数据库（地址， 用户名， 密码）
	mysql_select_db('ajaxMusic');  // 连接的数据库选择
	mysql_query('set names utf8');

?>