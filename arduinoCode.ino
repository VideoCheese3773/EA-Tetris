int w = 87;
int a = 65;
int s = 83;
int d = 68;
int f = 70;
int r = 82;
int q = 81;

void setup()
{
  Serial.begin(9600);
  for(int i = 7; i > 13; i++){
    pinMode(i, INPUT);
  }
}

void loop()
{
  if(digitalRead(10)){// W Pressed
  	Serial.println(w);
  }
  if(digitalRead(13)){// A Pressed
  	Serial.println(a);
  }
  if(digitalRead(12)){// S Pressed
  	Serial.println(s);
  }
  if(digitalRead(11)){// D Pressed
  	Serial.println(d);
  }
  if(digitalRead(9)){// F Pressed
  	Serial.println(f);
  }
  if(digitalRead(8)){// R Pressed
  	Serial.println(r);
  }
  if(digitalRead(7)){// Q Pressed
  	Serial.println(q);
  }
  delay(100);
}