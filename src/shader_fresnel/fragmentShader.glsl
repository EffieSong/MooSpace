   uniform vec3 fresnelColor;
   varying vec3 vPosition;
   varying vec3 vNormal;
   varying vec3 vNN;
   varying vec3 vEye;
   
    void main() {

        vec3 fresnelColor = vec3(1.0, 0.4627, 0.9098);
        // color = vec3(vPosition.z/4.+ 0.75,0.5,1.);
        // color = mix(color1,color2,vPosition.z * 0.5);
        
        float diff = dot(vec3(0.,4.,0.),vNormal)*0.1;
        gl_FragColor = vec4(abs(sin(diff*50.)));
        gl_FragColor = vec4(diff);
        gl_FragColor = vec4(gl_FragColor.rgb, 0.2);
        gl_FragColor.rgba +=  ( 1.0 - -min(dot(vEye, normalize(vNN) ), 0.0) ) * vec4(fresnelColor,0.9)*0.9;

   }