require "rubygems"
require "active_record"
require 'net/ssh'

load "models.rb"

keys = YAML::load_file("env.conf")

@machine_suffix = keys["str"]["machine_suffix"]
@email_suffix   = keys["str"]["email_suffix"]
@username = keys["cli"]["username"]
@password = keys["cli"]["password"]

ActiveRecord::Base.
  establish_connection(
    :adapter  => keys["db"]["adapter"],
    :host     => keys["db"]["host"],
    :username => keys["db"]["username"],
    :password => keys["db"]["password"],
    :database => keys["db"]["database"])

path_to_file = "./usage_data.txt"
puts "##### 1"

def parse_data_file(path_to_file)
  sessions = []

  if File.exist?(path_to_file)
    puts "File existed!"

    text=File.open(path_to_file).read
    text.gsub!(/\r\n?/, "\n")
    two_earlier = ""
    one_earlier = ""

    text.each_line do |line|
      if line.include? "query user"
        two_earlier = one_earlier
        one_earlier = line
        next
      elsif line.include? "USERNAME"
        two_earlier = one_earlier
        one_earlier = line
        next
      else
        query_cmd_segments = two_earlier.split(":")
        machine = query_cmd_segments[1].gsub(/\n/," ")
        chunks = line.split
        username = chunks[0]
        sessionname = chunks[1]
        state = chunks[3]
        if sessionname.include? "console"
          sessionname = "tty"
        end

        sessions << {
          host: machine,
          user: username,
          type: sessionname,# console / rdp-tcp#4 => ~device
          state: state # active
        }
      end
    end
  else
    puts "File NOT existed!"
  end
  sessions
end

puts "#### 2"
sessions = parse_data_file path_to_file
machines = {}
sessions.each do |session|
  host = session[:host]
  if !machines[host]
    machines[host] = []
  end
  machines[host] << session
end

puts "#### 3"


machines.each do |machine_name, formatted_outputs|
  puts machine_name
  puts formatted_outputs

  machine = Machine.where(name: machine_name).first
  stale_usages = Usage.where(machine: machine, end_time: nil)
  current_usages = {}
  usernames_using_machine = []

  formatted_outputs.each do |metadata|
    puts "metadata"
    username = metadata[:user]
    usernames_using_machine << username

    begin
      user = User
               .where(name: username, email: "#{username}#{@email_suffix}")
               .first_or_create
      puts "just inserted #{user.inspect}"
    rescue => ex
      puts "EXCEPTION"
      puts ex
    end

    begin
      usage = Usage
                .where(user: user, machine: machine,
                       start_time: Time.now,
                       device: metadata[:type],
                       end_time: nil).first_or_create
      puts "just inserted #{usage.inspect}"
      current_usages[usage[:id]] = usage
    rescue => ex
      puts "EXCEPTION"
      puts ex
    end
  end

  # find all Usages on the machine where not username

  stale_usages.each do |stale|
    saltine = current_usages[stale.id]
    if !saltine
      stale.update!(end_time: Time.now)
    end
  end
end

File.delete(path_to_file)
