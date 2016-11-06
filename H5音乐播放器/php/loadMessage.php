<?PHP

	require_once('connect.php');
	
	$mid = $_GET['mid']; // 获得mid数据
	
	$sql = "select * from message_list where mid = $mid"; // 查询 mid 想吐的数据
	
	$query = mysql_query($sql);
	
	if( $query && mysql_num_rows($query) ){
		while($row = mysql_fetch_assoc($query)){
			$data[] = $row;
		}
		echo json_encode($data);
	}

?>