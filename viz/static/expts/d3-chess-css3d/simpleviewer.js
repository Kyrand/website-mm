var boards = [], objects = [], moveNum= 0, newboard = false,
    BOARD_WIDTH = 300, BOARD_PADDING = 10,
    CAMERA_DIST = 2300,
    CAMERA_ROT_PROB = 0.5,
    MS_PER_MOVE = 2000,
    SimpleViewer = function(numObjects, containerId) {
        numObjects = typeof numObjects !== 'undefined'? numObjects: 100;
        containerId = typeof containerId !== 'undefined'? containerId: 'viewer';
        

        var objects = [], camera, scene, renderer,
            targets = { square:[], sphere: [], helix: [], grid: [] },
            vector = new THREE.Vector3(),
            group = new THREE.Object3D(),
            cameraTarget = new THREE.Object3D(),
            cameraAutoFlag = true,
            cameraRandFlag = false,
            cameraRotConst = 0.00002,
            cameraDist = CAMERA_DIST,
            msPerMove = MS_PER_MOVE;
        
        camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = cameraDist;
        camera.rotation.order = 'XZY';

        scene = new THREE.Scene();
        
        renderer = new THREE.CSS3DRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.position = 'absolute';
        document.getElementById(containerId).appendChild( renderer.domElement );

        //
        controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 0.5;
        // controls.minDistance = -500;
        // controls.maxDistance = 6000;
        controls.addEventListener( 'change', render );

        function onWindowResize() {
            
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize( window.innerWidth, window.innerHeight );
            render();
        }

        var time,
            timeToMove = new Date().getTime() + msPerMove;
        function animate() {
            var now = new Date().getTime(),
                dt = now - (time || now);
            time = now;
            // initiate moves if right time
            if(time > timeToMove){
                timeToMove = time + msPerMove;
                publish('moveBoards');
            }
            requestAnimationFrame( animate );
            TWEEN.update();
            if(cameraAutoFlag){
                
                // camera.position.x = cameraTarget.position.x + cameraDist * Math.cos( cameraRotConst * dt );         
                // camera.position.z = cameraTarget.position.z + cameraDist * Math.sin( cameraRotConst * dt );
                // camera.lookAt( cameraTarget.position );
                camera.position.set(0,0,0);
                if(cameraRandFlag){
                    if(Math.random() < CAMERA_ROT_PROB) camera.rotation.x += cameraRotConst * dt;
                    if(Math.random() < CAMERA_ROT_PROB) camera.rotation.y += cameraRotConst * dt;
                    if(Math.random() < CAMERA_ROT_PROB) camera.rotation.z += cameraRotConst * dt;
                }
                camera.rotation.x = Math.PI/4;
                camera.rotation.z = Math.PI/4;
                camera.rotation.y += cameraRotConst * dt;
                
                camera.translateZ(cameraDist);
                //console.log('Cam. pos; ' + JSON.stringify(camera.position));
                render();
            }
            else{
                controls.update();
            }
        }

        function render() {
            renderer.render( scene, camera );
        }
        
        var makeSquare = function(numObjects, gap) {
            numObjects = typeof numObjects !== 'undefined'? numObjects: objects.length;
            gap = typeof gap !== 'undefined'? gap: BOARD_WIDTH;

            var sz = Math.ceil(Math.sqrt(numObjects)),
                refp = (sz-1) * gap/2;
            targets.square = [];
            for ( var i = 0; i < numObjects; i ++ ) {

	        var object = new THREE.Object3D();

	        object.position.x = ( ( i % sz ) * gap ) - refp;
	        object.position.y = ( - ( Math.floor( i / sz ) % sz ) * gap ) + refp;
	        // object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
                object.position.z = 0;
	        targets.square.push( object );
            }
        };

        scene.add(group);
        var faces = d3.range(0,6).map(function() {
            var o = new THREE.Object3D();
            scene.add(o);
            return o;
        });
        
        var makeCube = function() {
            var o; 
            faces.forEach(function(f, i) {
                for(var j=0; j<9; j++){
                    // var o = objects[i*9 + j];
                    // o.position = targets.square[j].position.clone();
                    // o.rotation = targets.square[j].rotation.clone();
                    f.add(targets.square[j].clone());
                    // f.add(o);
                }
            });
            faces[0].position.z = 1.5 * BOARD_WIDTH; 
            faces[1].position.z = -1.5 * BOARD_WIDTH;
            faces[1].rotation.y -= Math.PI;
            faces[2].position.y = 1.5 * BOARD_WIDTH;
            faces[2].rotation.x -= Math.PI/2;
            faces[3].position.y = -1.5 * BOARD_WIDTH;
            faces[3].rotation.x += Math.PI/2;
            faces[4].position.x = 1.5 * BOARD_WIDTH;
            faces[4].rotation.y += Math.PI/2;
            faces[5].position.x = -1.5 * BOARD_WIDTH;
            faces[5].rotation.y -= Math.PI/2;
            scene.updateMatrixWorld();
            targets.cube = [];
            faces.forEach(function(f) {
                f.children.forEach(function(c) {
                    c.position.setFromMatrixPosition(c.matrixWorld);
                    c.rotation.setFromRotationMatrix(c.matrixWorld);
                    targets.cube.push(c);
                });
            });
        };

        
        var api = function(selection) {
            selection.each(function(data) {
                api.objectify(this);
            });

            makeSquare(9);
            makeCube();
        };

        api.targets = targets;
        api.makeOverlay = function(num) {
            targets.overlay = [];
            for(var i=0; i<num; i++){
                var obj = new THREE.Object3D();
                targets.overlay.push(obj);
            }
        };
        
        api.objectify = function(element) {
	    var object = new THREE.CSS3DObject( element );
	    object.position.x = Math.random() * 4000 - 2000;
	    object.position.y = Math.random() * 4000 - 2000;
	    // object.position.z = Math.random() * 4000 - 2000;
            object.position.z = 0;
            // group.add( object );
	    scene.add( object );

	    objects.push( object );
        }; 

        api.loadObjects = function(els) {
            els.forEach(function(el) {
                api.objectify(el);
            });
        };

        api.transform = function( targets, duration ) {

            TWEEN.removeAll();

            for ( var i = 0; i < objects.length; i ++ ) {

	        var object = objects[ i ];
	        var target = targets[ i ];

	        new TWEEN.Tween( object.position )
	            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
	            .easing( TWEEN.Easing.Exponential.InOut )
	            .start();

	        new TWEEN.Tween( object.rotation )
	            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
	            .easing( TWEEN.Easing.Exponential.InOut )
	            .start();

            }

            new TWEEN.Tween( this )
	        .to( {}, duration * 2 )
	        .onUpdate( render )
	        .start();
        };

        api.setCameraAuto = function(state) {
            cameraAutoFlag = state;
        };
        
        api.setMSPerMove = function(ms) {
            msPerMove = ms;
        };

        api.camera = camera;
        api.controls = controls;
        api.group = group;
        api.render = render;
        api.animate = animate;

        // Make targets
        //animate();
        return api;
    };
