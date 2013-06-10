<?php
mysql_connect('localhost', 'root', '');
mysql_select_db('smgen');
?>
<html>
    <head>
        <title>SourceModGen by PimpinJuice</title>
        <link rel="stylesheet" href="smgen.css" />
        <script src="jquery.js"></script>
        <script src="ZeroClipboard.js"></script>
        <script src="smgen.js"></script>
        <script type="text/javascript">
            $(document).ready(function() {
                window.defaultSMGen();

                <?php
                if(!empty($_GET['id'])) {
                    $guid = $_GET['id'];

                    $guidEscaped = mysql_real_escape_string($guid);

                    $result = mysql_query("SELECT `data` FROM `smgen` WHERE `guid` = '{$guidEscaped}'");

                    $row = mysql_fetch_assoc($result);

                    if(!empty($row)) {
                        $jsonData = $row['data'];
                        ?>
                        window.loadSMGen(<?= $jsonData ?>);
                        <?php
                    }
                }
                ?>
            });
        </script>
    </head>
    <body>
        <h2>SourceModGen v1.1 by PimpinJuice</h2>
        <p>Please describe your structure and ADT-functions will be generated.</p>
        <p>Examples: <a href="#" class="vipPlayerExampleLink">VIP Player</a>, <a href="#" class="vipRescueZoneExampleLink">VIP Rescue Zone</a></p>
        <form id="gen">
            <h4>Basic Info</h4>
            <label>Structure Name: <input name="structure_name" type="text" value="" /></label>
            <h4>Fields</h4>
            <table>
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Do Not Save [kv] <a href="#" title="Exclude from KV write functions. Recommended for Handle and Handles types.">(?)</a></th>
                        <th>Do Not Load [kv] <a href="#" title="Exclude from KV read functions. Recommended for Handle and Handles types.">(?)</a></th>
                        <th>Remove</th>
                        <th>Move Up</th>
                        <th>Move Down</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            <a href="#" class="addFieldLink">Add Field To Bottom</a>
            <h4>Generator Options</h4>
            <label>Function Prefix [naming]: <input name="function_prefix" value="" /></label>
            <label>Function Parameter Prefix [naming]: <input name="function_param_prefix" value="" /></label>
            <label>Variable Prefix [naming]: <input name="function_var_prefix" value="" /></label>
            <label>Spaces Instead Of Tabs [formatting]: <input name="generate_use_spaces" type="checkbox" value="1" /></label>
            <label>Space Count for Tab (if above enabled) [formatting]: <input name="generate_space_count" type="text" value="" /></label>
            <input type="submit" value="Generate Functions" />&nbsp;<input id="saveBtn" type="button" value="Save (link a friend)" />
        </form>

        <hr />
        <span id="outputLabel">Output <a href="#" id="copyClipLink" data-clipboard-target="output">[copy to clipboard]</a>:</span>
        <textarea id="output" readonly="readonly"></textarea>
    </body>
</html>